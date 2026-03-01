import { useState, useEffect, useRef } from "react";
import {
  Shield, FileText, Download, Trash2, Eye, EyeOff, Lock, Cookie,
  AlertTriangle, Check, X, Mail, Phone, MapPin, ExternalLink, Loader2,
  Upload, Settings, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const documents = [
  { title: "Политика конфиденциальности", version: "v3.2", date: "15.02.2026" },
  { title: "Пользовательское соглашение", version: "v4.1", date: "15.02.2026" },
  { title: "Политика обработки cookies", version: "v2.0", date: "15.02.2026" },
  { title: "Согласие на обработку ПД", version: "v1.5", date: "15.02.2026" },
];

const faqItems = [
  { q: "Какие данные вы собираете?", a: "Мы собираем данные, необходимые для работы сервиса: email, имя, данные профиля, информацию о проектах и действиях в системе. Полный перечень указан в Политике конфиденциальности." },
  { q: "Как долго хранятся мои данные?", a: "Персональные данные хранятся в течение срока действия вашего аккаунта и 30 дней после его деактивации. Финансовые документы хранятся 5 лет в соответствии с законодательством РФ." },
  { q: "Передаёте ли вы данные третьим лицам?", a: "Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ, и технических партнёров (хостинг, платёжные системы) с которыми заключены NDA." },
  { q: "Как подать запрос на удаление данных?", a: "Вы можете подать запрос на удаление через раздел «Управление данными» на этой странице или написав на privacy@buildverse.ai. Мы обработаем запрос в течение 30 дней в соответствии с ФЗ-152." },
];

const PrivacyPage = () => {
  const { user, profile, updateProfile } = useAuth();
  const [docModal, setDocModal] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<"deactivation" | "full">("deactivation");
  const [deletePassword, setDeletePassword] = useState("");
  const [archiveFormat, setArchiveFormat] = useState("JSON");
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [correctionText, setCorrectionText] = useState("");
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [privacyRequests, setPrivacyRequests] = useState<any[]>([]);

  // Privacy settings from profile
  const [profileVisibility, setProfileVisibility] = useState(profile?.profile_visibility || "private");

  // Cookie preferences
  const [cookies, setCookies] = useState({ analytics: false, functional: false, marketing: false });
  const [cookiesLoading, setCookiesLoading] = useState(false);

  // Contact form
  const [contactTopic, setContactTopic] = useState("");
  const [contactDesc, setContactDesc] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const contactFileRef = useRef<HTMLInputElement>(null);
  const [contactFile, setContactFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) return;
    // Load cookie prefs
    supabase.from("cookie_preferences").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setCookies({ analytics: data.analytics ?? false, functional: data.functional ?? false, marketing: data.marketing ?? false });
    });
    // Load privacy requests
    supabase.from("privacy_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setPrivacyRequests(data);
    });
  }, [user]);

  useEffect(() => {
    if (profile) setProfileVisibility(profile.profile_visibility || "private");
  }, [profile]);

  if (!user) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
        <Shield className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
        <h2 className="text-lg font-bold text-foreground mb-2">Конфиденциальность</h2>
        <p className="text-sm text-muted-foreground">Войдите в аккаунт для доступа к настройкам приватности.</p>
      </div>
    );
  }

  const saveCookies = async (prefs: typeof cookies) => {
    setCookiesLoading(true);
    try {
      const { data: existing } = await supabase.from("cookie_preferences").select("id").eq("user_id", user.id).maybeSingle();
      if (existing) {
        await supabase.from("cookie_preferences").update(prefs).eq("user_id", user.id);
      } else {
        await supabase.from("cookie_preferences").insert({ user_id: user.id, ...prefs });
      }
      setCookies(prefs);
      toast({ title: "Настройки cookies сохранены" });
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setCookiesLoading(false);
    }
  };

  const requestArchive = async () => {
    setArchiveLoading(true);
    try {
      const { error } = await supabase.from("privacy_requests").insert({
        user_id: user.id, request_type: "archive", format: archiveFormat, status: "pending",
      });
      if (error) throw error;
      toast({ title: "Запрос на экспорт принят", description: "Вы получите ссылку на скачивание на email. Ссылка действует 24 часа." });
      const { data } = await supabase.from("privacy_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setPrivacyRequests(data);
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setArchiveLoading(false);
    }
  };

  const requestDeletion = async () => {
    try {
      const { error } = await supabase.from("privacy_requests").insert({
        user_id: user.id, request_type: deleteType === "full" ? "deletion" : "deactivation", status: "pending",
        details: `Тип: ${deleteType === "full" ? "Полное удаление (7 дней)" : "Деактивация (30 дней)"}`,
      });
      if (error) throw error;
      toast({ title: "Запрос принят", description: deleteType === "full" ? "Аккаунт будет удалён через 7 дней." : "Аккаунт деактивирован. Восстановление возможно в течение 30 дней." });
      setDeleteModal(false);
      setDeletePassword("");
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  const submitCorrection = async () => {
    if (!correctionText.trim()) return;
    setCorrectionLoading(true);
    try {
      const { error } = await supabase.from("privacy_requests").insert({
        user_id: user.id, request_type: "correction", details: correctionText, status: "pending",
      });
      if (error) throw error;
      toast({ title: "Запрос на исправление принят", description: "Мы рассмотрим запрос в течение 30 дней." });
      setCorrectionText("");
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setCorrectionLoading(false);
    }
  };

  const handleVisibilityChange = async (val: string) => {
    setProfileVisibility(val);
    await updateProfile({ profile_visibility: val });
    toast({ title: "Видимость обновлена" });
  };

  const handleContactSubmit = async () => {
    if (!contactTopic.trim() || !contactDesc.trim()) { toast({ title: "Заполните все поля", variant: "destructive" }); return; }
    setContactLoading(true);
    try {
      let fileUrls: string[] = [];
      if (contactFile) {
        const ext = contactFile.name.split(".").pop();
        const path = `${user.id}/privacy/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("uploads").upload(path, contactFile);
        if (!uploadErr) {
          const { data } = supabase.storage.from("uploads").getPublicUrl(path);
          fileUrls = [data.publicUrl];
        }
      }
      const { error } = await supabase.from("contact_messages").insert({
        user_id: user.id, topic: contactTopic, message: contactDesc, email: user.email, source: "privacy", file_urls: fileUrls,
      });
      if (error) throw error;
      toast({ title: "Обращение отправлено", description: "DPO рассмотрит ваш запрос." });
      setContactTopic(""); setContactDesc(""); setContactFile(null);
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Конфиденциальность и данные</h2>
          <p className="text-xs text-muted-foreground">Управляйте персональными данными, приватностью и cookies</p>
        </div>
      </div>

      {/* Documents */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Политики и документы</h3>
        <div className="space-y-2">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <div>
                <span className="text-sm text-foreground">{doc.title}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{doc.version}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDocModal(doc.title)} className="text-xs text-primary h-7">
                  <Eye className="w-3 h-3 mr-1" /> Читать
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                  <Download className="w-3 h-3 mr-1" /> PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 rounded-lg px-3 py-2">
          <Check className="w-3 h-3" /> Вы приняли актуальные версии всех документов (от 15.02.2026)
        </div>
      </div>

      {/* Data management */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Download className="w-4 h-4 text-primary" /> Управление данными</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-white/5 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-foreground">Экспорт данных</h4>
            <div className="flex items-center gap-2">
              <select value={archiveFormat} onChange={(e) => setArchiveFormat(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-foreground">
                {["JSON", "CSV", "PDF", "IFC"].map((f) => <option key={f} value={f} className="bg-background">{f}</option>)}
              </select>
              <Button size="sm" onClick={requestArchive} disabled={archiveLoading} className="bg-primary text-primary-foreground text-xs h-7">
                {archiveLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Download className="w-3 h-3 mr-1" /> Запросить архив</>}
              </Button>
            </div>
          </div>

          <div className="flex-1 bg-white/5 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-foreground">Удалить аккаунт</h4>
            <Button size="sm" variant="destructive" onClick={() => setDeleteModal(true)} className="text-xs h-7">
              <Trash2 className="w-3 h-3 mr-1" /> Удалить аккаунт
            </Button>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Запрос на исправление данных</h4>
          <Textarea value={correctionText} onChange={(e) => setCorrectionText(e.target.value)} placeholder="Опишите, какие данные требуют исправления…" className="bg-white/5 border-white/10 text-foreground text-xs min-h-[60px]" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground">Срок рассмотрения: до 30 дней</span>
            <Button size="sm" onClick={submitCorrection} disabled={correctionLoading} className="bg-primary text-primary-foreground text-xs h-7">
              {correctionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Подать запрос"}
            </Button>
          </div>
        </div>

        {privacyRequests.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-foreground">Ваши запросы</h4>
            {privacyRequests.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-white/5 rounded px-3 py-1.5 text-xs">
                <span className="text-foreground capitalize">{r.request_type === "archive" ? "Экспорт" : r.request_type === "correction" ? "Исправление" : r.request_type === "deletion" ? "Удаление" : "Деактивация"}</span>
                <span className={`${r.status === "pending" ? "text-yellow-400" : r.status === "completed" ? "text-green-400" : "text-muted-foreground"}`}>
                  {r.status === "pending" ? "В обработке" : r.status === "completed" ? "Выполнен" : r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy settings */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Настройки приватности</h3>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Видимость профиля</Label>
            <div className="flex gap-2">
              {[
                { val: "private", label: "Приватный", icon: EyeOff },
                { val: "partners", label: "Для партнёров", icon: Eye },
                { val: "public", label: "Публичный", icon: Eye },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleVisibilityChange(opt.val)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs flex items-center justify-center gap-1.5 transition-all ${
                    profileVisibility === opt.val ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  <opt.icon className="w-3 h-3" /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <span className="text-xs text-foreground">Использование данных для обучения AI</span>
            <Switch defaultChecked={false} />
          </div>
          <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <span className="text-xs text-foreground">Аналитика использования</span>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Cookies */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Cookie className="w-4 h-4 text-primary" /> Cookies и отслеживание</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <span className="text-xs text-foreground">Необходимые</span>
            <span className="text-[10px] text-green-400">Всегда включены</span>
          </div>
          {[
            { key: "analytics" as const, label: "Аналитические" },
            { key: "functional" as const, label: "Функциональные" },
            { key: "marketing" as const, label: "Маркетинговые" },
          ].map((c) => (
            <div key={c.key} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <span className="text-xs text-foreground">{c.label}</span>
              <Switch
                checked={cookies[c.key]}
                onCheckedChange={(val) => setCookies({ ...cookies, [c.key]: val })}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => saveCookies({ analytics: true, functional: true, marketing: true })} className="text-xs h-7 bg-primary text-primary-foreground">Принять все</Button>
          <Button size="sm" variant="outline" onClick={() => saveCookies({ analytics: false, functional: false, marketing: false })} className="text-xs h-7 border-white/10 text-foreground">Отклонить все</Button>
          <Button size="sm" variant="outline" onClick={() => saveCookies(cookies)} disabled={cookiesLoading} className="text-xs h-7 border-white/10 text-foreground">
            {cookiesLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Сохранить выбор"}
          </Button>
        </div>
      </div>

      {/* Security status */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-foreground">Безопасность хранения</span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-green-400 bg-green-400/10 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          Все системы защиты работают в штатном режиме
        </div>
      </div>

      {/* Your rights */}
      <div className="glass-card rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-bold text-foreground">Ваши права</h3>
        {[
          { label: "Запросить отчёт о данных", action: () => requestArchive() },
          { label: "Редактировать профиль", action: () => {} },
          { label: "Удалить аккаунт", action: () => setDeleteModal(true) },
          { label: "Экспортировать данные", action: () => requestArchive() },
          { label: "Настройки приватности", action: () => {} },
        ].map((r, i) => (
          <button key={i} onClick={r.action} className="w-full flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-white/10 transition-colors">
            {r.label} <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Contacts */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Контакты и жалобы</h3>
        <div className="flex flex-col sm:flex-row gap-3 text-xs">
          <a href="mailto:privacy@buildverse.ai" className="flex items-center gap-1.5 text-primary"><Mail className="w-3 h-3" /> privacy@buildverse.ai</a>
          <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3 h-3" /> +7 (495) 123-45-68</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="w-3 h-3" /> г. Москва, ул. Примерная, д. 1</span>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          <Input value={contactTopic} onChange={(e) => setContactTopic(e.target.value)} placeholder="Тема обращения" className="bg-white/5 border-white/10 text-foreground text-sm" />
          <Textarea value={contactDesc} onChange={(e) => setContactDesc(e.target.value)} placeholder="Описание" className="bg-white/5 border-white/10 text-foreground text-sm min-h-[60px]" />
          <div className="flex items-center gap-2">
            <input ref={contactFileRef} type="file" className="hidden" onChange={(e) => setContactFile(e.target.files?.[0] || null)} />
            <Button variant="outline" size="sm" onClick={() => contactFileRef.current?.click()} className="border-white/10 text-xs text-foreground h-7">
              <Upload className="w-3 h-3 mr-1" /> Файл
            </Button>
            {contactFile && <span className="text-[10px] text-muted-foreground">{contactFile.name}</span>}
            <Button size="sm" onClick={handleContactSubmit} disabled={contactLoading} className="ml-auto bg-primary text-primary-foreground text-xs h-7">
              {contactLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Отправить"}
            </Button>
          </div>
        </div>

        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <a href="https://rkn.gov.ru" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
            <ExternalLink className="w-2.5 h-2.5" /> Роскомнадзор
          </a>
          <a href="https://edpb.europa.eu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
            <ExternalLink className="w-2.5 h-2.5" /> Европейский DPA
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground px-1">Частые вопросы</h3>
        <Accordion type="single" collapsible className="space-y-1">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl border-0 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 text-sm text-foreground hover:no-underline hover:bg-white/5">{item.q}</AccordionTrigger>
              <AccordionContent className="px-4 pb-3 text-xs text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Document modal */}
      <Dialog open={!!docModal} onOpenChange={() => setDocModal(null)}>
        <DialogContent className="glass-card border-white/10 max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{docModal}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Актуальная версия документа</DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground space-y-3 mt-4">
            <p>Настоящий документ определяет порядок обработки и защиты персональных данных пользователей платформы BUILDVERSE.</p>
            <p>1. Оператор обработки данных: ООО «СтарТехПро», ОГРН XXXXXXXXXXXXX, ИНН XXXXXXXXXX.</p>
            <p>2. Цели обработки: предоставление сервисов платформы, улучшение качества обслуживания, обеспечение безопасности.</p>
            <p>3. Категории данных: идентификационные данные, контактная информация, данные об использовании сервиса.</p>
            <p>4. Основания обработки: согласие субъекта, исполнение договора, законные интересы оператора.</p>
            <p>Полный текст документа доступен по запросу на privacy@buildverse.ai.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete modal */}
      <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
        <DialogContent className="glass-card border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Удаление аккаунта
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">Это действие необратимо. Все ваши данные будут удалены.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              {[
                { val: "deactivation" as const, label: "Деактивация", desc: "Аккаунт отключается на 30 дней. Можно восстановить." },
                { val: "full" as const, label: "Полное удаление", desc: "Необратимое удаление через 7 дней." },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setDeleteType(opt.val)}
                  className={`w-full text-left rounded-lg px-4 py-3 transition-all ${
                    deleteType === opt.val ? "bg-destructive/10 border border-destructive/30" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Подтвердите паролем</Label>
              <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Введите пароль" className="bg-white/5 border-white/10 text-foreground" />
            </div>
            <Button variant="destructive" onClick={requestDeletion} disabled={!deletePassword} className="w-full">
              {deleteType === "full" ? "Удалить безвозвратно" : "Деактивировать аккаунт"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivacyPage;
