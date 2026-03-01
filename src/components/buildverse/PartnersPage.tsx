import { useState, useEffect, useRef } from "react";
import {
  Handshake, TrendingUp, Shield, Users, Zap, ChevronDown, Upload, X, Check,
  Mail, Phone, Clock, FileText, ArrowRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const specializations = [
  "Фундаментные работы", "Кровельные работы", "Отделка", "Инженерия (электрика, сантехника)",
  "Ландшафтный дизайн", "Архитектурное проектирование", "BIM-моделирование",
  "Поставка стройматериалов", "Логистика", "Другое",
];

const russianRegions = [
  "Москва", "Санкт-Петербург", "Московская область", "Краснодарский край",
  "Свердловская область", "Новосибирская область", "Татарстан", "Ростовская область",
  "Нижегородская область", "Челябинская область", "Самарская область", "Башкортостан",
  "Пермский край", "Воронежская область", "Красноярский край", "Тюменская область",
  "Другие регионы",
];

const advantages = [
  { icon: TrendingUp, title: "Постоянный поток клиентов", desc: "Получайте заказы от частных застройщиков и девелоперов через экосистему BUILDVERSE." },
  { icon: Shield, title: "Гарантия оплаты", desc: "Все расчёты проходят через безопасный эскроу-счёт. Деньги переводятся после приёмки работ." },
  { icon: Users, title: "Рейтинг и отзывы", desc: "Ваш профессиональный профиль с рейтингом виден тысячам потенциальных заказчиков." },
  { icon: Zap, title: "AI-инструменты", desc: "Используйте AI BUILDVERSE для автоматизации смет, тендеров и коммуникации с клиентами." },
];

const levels = [
  { name: "Базовый", subtitle: "Старт", price: "Бесплатно", leads: "До 5 лидов/мес", commission: "Стандартная комиссия 15%", features: ["Профиль в каталоге", "Базовая аналитика", "Чат с клиентами"] },
  { name: "Профи", subtitle: "Бизнес", price: "от 4 990 ₽/мес", leads: "До 50 лидов/мес", commission: "Пониженная комиссия 8%", features: ["Приоритет в поиске", "Расширенная аналитика", "Премиум-значок", "Участие в тендерах"] },
  { name: "Премиум", subtitle: "Экосистема", price: "Индивидуально", leads: "Безлимитные лиды", commission: "Комиссия обсуждается", features: ["Персональный менеджер", "API-интеграция", "Эксклюзивные проекты", "Брендирование"] },
];

const faqItems = [
  { q: "Нужно ли уметь работать с BIM?", a: "Нет, работа с BIM не является обязательным требованием. BUILDVERSE предоставляет собственные AI-инструменты для моделирования. Однако если вы владеете BIM-технологиями, это будет вашим конкурентным преимуществом и откроет доступ к более сложным и высокооплачиваемым проектам." },
  { q: "Как гарантируете оплату?", a: "Все расчёты между заказчиком и подрядчиком проходят через защищённый эскроу-счёт BUILDVERSE. Заказчик вносит предоплату на эскроу при старте этапа, а средства переводятся подрядчику только после подтверждения приёмки работ. В случае спора привлекается независимый арбитр платформы." },
  { q: "Можно ли работать напрямую с клиентом?", a: "Да, после завершения первого совместного проекта через платформу вы можете продолжить сотрудничество с клиентом напрямую. Однако мы рекомендуем использовать инструменты BUILDVERSE для управления проектами, так как это обеспечивает безопасность расчётов и автоматизацию документооборота." },
];

const PartnersPage = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingApp, setExistingApp] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contactFileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [inn, setInn] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [legalAddress, setLegalAddress] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [regionsOpen, setRegionsOpen] = useState(false);

  // Quick contact
  const [contactTopic, setContactTopic] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactFile, setContactFile] = useState<File | null>(null);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("partner_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) setExistingApp(data[0]);
        });
    }
  }, [user]);

  const toggleRegion = (r: string) => {
    setRegions((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);
  };

  const uploadFiles = async (filesToUpload: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/partners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("uploads").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("uploads").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!user) { toast({ title: "Войдите в аккаунт для подачи заявки", variant: "destructive" }); return; }
    if (!specialization || regions.length === 0) { toast({ title: "Заполните специализацию и регион", variant: "destructive" }); return; }

    setLoading(true);
    try {
      const fileUrls = files.length > 0 ? await uploadFiles(files) : [];

      const { error } = await supabase.from("partner_applications").insert({
        user_id: user.id,
        inn,
        company_name: companyName,
        legal_address: legalAddress,
        specialization,
        regions,
        contact_email: user.email,
        file_urls: fileUrls,
        status: "pending",
      });

      if (error) throw error;

      toast({ title: "Заявка принята!", description: "Менеджер свяжется с вами в течение 24 часов." });
      setShowForm(false);
      // Reload
      const { data } = await supabase.from("partner_applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
      if (data?.[0]) setExistingApp(data[0]);
    } catch (e: any) {
      toast({ title: "Ошибка отправки", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickContact = async () => {
    if (!contactTopic.trim() || !contactMessage.trim()) { toast({ title: "Заполните тему и сообщение", variant: "destructive" }); return; }
    setContactLoading(true);
    try {
      let fileUrls: string[] = [];
      if (contactFile && user) {
        fileUrls = await uploadFiles([contactFile]);
      }
      const { error } = await supabase.from("contact_messages").insert({
        user_id: user?.id || null,
        topic: contactTopic,
        message: contactMessage,
        email: user?.email || null,
        source: "partners",
        file_urls: fileUrls,
      });
      if (error) throw error;
      toast({ title: "Сообщение отправлено!", description: "Мы свяжемся с вами в ближайшее время." });
      setContactTopic(""); setContactMessage(""); setContactFile(null);
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setContactLoading(false);
    }
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "На рассмотрении", color: "text-yellow-400" },
    approved: { label: "Одобрена", color: "text-green-400" },
    rejected: { label: "Требуется исправление", color: "text-red-400" },
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Hero */}
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
          <Handshake className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Станьте партнёром BUILDVERSE</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-4">
          Присоединяйтесь к экосистеме и получайте доступ к потоку клиентов, AI-инструментам и безопасным расчётам.
        </p>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Handshake className="w-4 h-4 mr-2" /> Стать партнёром
        </Button>
      </div>

      {/* Advantages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {advantages.map((a, i) => (
          <div key={i} className="glass-card rounded-xl p-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <a.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{a.title}</h3>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Levels table */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground px-1">Уровни сотрудничества</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {levels.map((l, i) => (
            <div key={i} className={`glass-card rounded-xl p-4 space-y-3 ${i === 1 ? "border-primary/40 ring-1 ring-primary/20" : ""}`}>
              {i === 1 && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Популярный</span>}
              <div>
                <h4 className="text-base font-bold text-foreground">{l.name}</h4>
                <span className="text-xs text-muted-foreground">{l.subtitle}</span>
              </div>
              <div className="text-lg font-bold text-primary">{l.price}</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{l.leads}</div>
                <div>{l.commission}</div>
              </div>
              <ul className="space-y-1">
                {l.features.map((f, fi) => (
                  <li key={fi} className="text-xs text-foreground flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Application form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Заявка на партнёрство</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">ИНН</Label>
              <Input value={inn} onChange={(e) => setInn(e.target.value)} placeholder="10 или 12 цифр" className="bg-white/5 border-white/10 text-foreground text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Название организации</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ООО «Название»" className="bg-white/5 border-white/10 text-foreground text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Юридический адрес</Label>
            <Input value={legalAddress} onChange={(e) => setLegalAddress(e.target.value)} placeholder="Город, улица, дом" className="bg-white/5 border-white/10 text-foreground text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Специализация *</Label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="" className="bg-background">Выберите специализацию</option>
              {specializations.map((s) => (
                <option key={s} value={s} className="bg-background">{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Регионы работы * (можно выбрать несколько)</Label>
            <div className="relative">
              <button
                onClick={() => setRegionsOpen(!regionsOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-left flex items-center justify-between text-foreground"
              >
                <span className={regions.length ? "text-foreground" : "text-muted-foreground"}>
                  {regions.length ? `Выбрано: ${regions.length}` : "Выберите регионы"}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              {regionsOpen && (
                <div className="absolute z-10 top-full mt-1 w-full glass-card rounded-lg p-2 max-h-48 overflow-y-auto space-y-0.5">
                  {russianRegions.map((r) => (
                    <button
                      key={r}
                      onClick={() => toggleRegion(r)}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                        regions.includes(r) ? "bg-primary/20 text-primary" : "text-foreground hover:bg-white/10"
                      }`}
                    >
                      {regions.includes(r) && <Check className="w-3 h-3 inline mr-1.5" />}{r}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {regions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {regions.map((r) => (
                  <span key={r} className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                    {r} <button onClick={() => toggleRegion(r)}><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Документы (PDF, JPG, PNG)</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-white/10 text-foreground text-xs">
              <Upload className="w-3 h-3 mr-1.5" /> Загрузить файлы
            </Button>
            {files.length > 0 && (
              <div className="space-y-1 mt-1">
                {files.map((f, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {f.name}
                    <button onClick={() => setFiles(files.filter((_, fi) => fi !== i))}><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-primary text-primary-foreground">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Handshake className="w-4 h-4 mr-2" />}
            Подать заявку
          </Button>
        </div>
      )}

      {/* Existing application status */}
      {existingApp && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">Статус вашей заявки</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${existingApp.status === "approved" ? "bg-green-400" : existingApp.status === "rejected" ? "bg-red-400" : "bg-yellow-400"}`} />
            <span className={`text-sm font-medium ${statusMap[existingApp.status]?.color || "text-muted-foreground"}`}>
              {statusMap[existingApp.status]?.label || existingApp.status}
            </span>
          </div>
          {existingApp.admin_comment && (
            <p className="text-xs text-muted-foreground bg-white/5 rounded-lg p-3">{existingApp.admin_comment}</p>
          )}
        </div>
      )}

      {/* Process */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground px-1">Процесс вступления</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { step: 1, title: "Подача заявки", desc: "Заполните форму и приложите документы. Мы проверим информацию.", status: existingApp ? "done" : "current" },
            { step: 2, title: "Проверка и верификация", desc: "Наш менеджер свяжется с вами для уточнения деталей.", status: existingApp?.status === "approved" ? "done" : existingApp ? "current" : "pending" },
            { step: 3, title: "Начало работы", desc: "Получите доступ к кабинету партнёра и начните принимать заказы.", status: existingApp?.status === "approved" ? "done" : "pending" },
          ].map((s) => (
            <div key={s.step} className="glass-card rounded-xl p-4 flex gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                s.status === "done" ? "bg-primary/20 text-primary" : s.status === "current" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-muted-foreground"
              }`}>
                {s.status === "done" ? <Check className="w-4 h-4" /> : s.step}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground px-1">Частые вопросы</h3>
        <Accordion type="single" collapsible className="space-y-1">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl border-0 overflow-hidden">
              <AccordionTrigger className="px-4 py-3 text-sm text-foreground hover:no-underline hover:bg-white/5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 text-xs text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Contacts */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Контакты партнёрского отдела</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="mailto:partners@buildverse.ai" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <Mail className="w-4 h-4" /> partners@buildverse.ai
          </a>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" /> +7 (495) 123-45-67
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" /> Пн–Пт 10:00–18:00 МСК
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Хотите обсудить индивидуальные условия? Напишите нам — подберём оптимальную модель сотрудничества.
        </p>

        {/* Quick contact form */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <h4 className="text-xs font-semibold text-foreground">Быстрое обращение</h4>
          <Input value={contactTopic} onChange={(e) => setContactTopic(e.target.value)} placeholder="Тема" className="bg-white/5 border-white/10 text-foreground text-sm" />
          <Textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Сообщение" className="bg-white/5 border-white/10 text-foreground text-sm min-h-[80px]" />
          <div className="flex items-center gap-3">
            <input ref={contactFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setContactFile(e.target.files?.[0] || null)} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => contactFileRef.current?.click()} className="border-white/10 text-foreground text-xs">
              <Upload className="w-3 h-3 mr-1.5" /> Файл
            </Button>
            {contactFile && <span className="text-xs text-muted-foreground">{contactFile.name}</span>}
            <Button onClick={handleQuickContact} disabled={contactLoading} size="sm" className="ml-auto bg-primary text-primary-foreground text-xs">
              {contactLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Отправить"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnersPage;
