import { useState, useEffect, useRef } from "react";
import {
  HelpCircle, Search, MessageSquare, Mail, Clock, Phone, Upload,
  FileText, Loader2, ChevronRight, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const faqCategories = [
  {
    title: "Начало работы",
    items: [
      { q: "Как начать пользоваться BUILDVERSE?", a: "Зарегистрируйтесь на платформе, выберите роль (частное лицо, профессионал или компания) и начните диалог с AI-агентом. Он проведёт вас через все этапы — от анализа участка до создания проекта." },
      { q: "Какие роли доступны при регистрации?", a: "При регистрации доступны роли: Частное лицо (для личного строительства), Самозанятый, ИП, ООО (для бизнеса), Поставщик, Архитектор и Девелопер. Роль определяет набор доступных инструментов." },
    ],
  },
  {
    title: "Тарифы и оплата",
    items: [
      { q: "Можно ли пользоваться бесплатно?", a: "Да, базовый тариф «Старт» бесплатен и включает ограниченное количество AI-запросов, 1 ГБ облачного хранилища и до 3 активных проектов. Для расширенного функционала доступны тарифы Pro, Business и Enterprise." },
      { q: "Как оплатить подписку?", a: "Оплата принимается банковскими картами (Visa, Mastercard, МИР) через защищённый платёжный шлюз. Для юридических лиц доступна оплата по счёту. Все транзакции и закрывающие документы доступны в разделе «Настройки → Тарифы»." },
    ],
  },
  {
    title: "Безопасность и данные",
    items: [
      { q: "Как защищены мои данные?", a: "Все данные шифруются при передаче (TLS 1.3) и хранении (AES-256). Серверы расположены в сертифицированных дата-центрах на территории РФ. Мы соблюдаем требования ФЗ-152 и GDPR." },
      { q: "Могу ли я удалить свои данные?", a: "Да, вы можете запросить полное удаление всех персональных данных через раздел «Конфиденциальность → Управление данными». Запрос обрабатывается в течение 7 рабочих дней." },
    ],
  },
  {
    title: "Партнёрам",
    items: [
      { q: "Как стать партнёром?", a: "Перейдите в раздел «Партнёры» и заполните заявку. После проверки документов и верификации наш менеджер свяжется с вами для обсуждения условий сотрудничества." },
      { q: "Какую комиссию берёт платформа?", a: "Комиссия зависит от уровня партнёрства: Базовый — 15%, Профи — 8%, Премиум — индивидуально. Все расчёты проходят через защищённый эскроу-счёт." },
    ],
  },
  {
    title: "Техническое",
    items: [
      { q: "Какие браузеры поддерживаются?", a: "BUILDVERSE поддерживает последние версии Chrome, Firefox, Safari и Edge. Для работы с 3D-моделями рекомендуется Chrome или Firefox с поддержкой WebGL 2.0." },
      { q: "Как работает AI-агент?", a: "AI-агент BUILDVERSE использует комбинацию языковых моделей и специализированных строительных баз знаний. Он анализирует ваш запрос, учитывает контекст проекта (геоданные, бюджет, нормативы) и формирует персонализированные рекомендации." },
    ],
  },
];

const topics = ["Техническая проблема", "Вопрос по тарифу", "Партнёрство", "Другое"];

const HelpPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ ticket_number: number } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Filter FAQ
  const filteredCategories = searchQuery.trim()
    ? faqCategories.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : faqCategories;

  const handleSubmit = async () => {
    if (!topic || !message.trim()) { toast({ title: "Заполните тему и сообщение", variant: "destructive" }); return; }
    setLoading(true);
    try {
      let fileUrls: string[] = [];
      if (files.length > 0 && user) {
        for (const file of files) {
          const ext = file.name.split(".").pop();
          const path = `${user.id}/support/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from("uploads").upload(path, file);
          if (!uploadErr) {
            const { data } = supabase.storage.from("uploads").getPublicUrl(path);
            fileUrls.push(data.publicUrl);
          }
        }
      }

      const { data, error } = await supabase.from("support_tickets").insert({
        user_id: user?.id || null,
        topic,
        message,
        email: user?.email || "anonymous@buildverse.ai",
        file_urls: fileUrls,
      }).select("ticket_number").single();

      if (error) throw error;

      setCreatedTicket(data);
      toast({ title: `Заявка #${data.ticket_number} принята`, description: "Ответим в течение 24 часов." });
      setShowForm(false);
      setTopic(""); setMessage(""); setFiles([]);
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Hero */}
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Центр помощи</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-4">
          Найдите ответ на свой вопрос или свяжитесь с нашей поддержкой.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по базе знаний…"
            className="pl-10 bg-white/5 border-white/10 text-foreground"
          />
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground">
            <MessageSquare className="w-4 h-4 mr-2" /> Написать в поддержку
          </Button>
          <Button variant="outline" onClick={() => setSearchQuery("")} className="border-white/10 text-foreground">
            <HelpCircle className="w-4 h-4 mr-2" /> Частые вопросы
          </Button>
        </div>
      </div>

      {/* Ticket confirmation */}
      {createdTicket && (
        <div className="glass-card rounded-xl p-4 border-green-400/30 bg-green-400/5">
          <div className="flex items-center gap-2 text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-sm font-semibold">Заявка #{createdTicket.ticket_number} принята</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Мы ответим на указанный email в течение 24 часов.</p>
        </div>
      )}

      {/* Support form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Обратиться в поддержку</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Тема обращения *</Label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-foreground"
            >
              <option value="" className="bg-background">Выберите тему</option>
              {topics.map((t) => <option key={t} value={t} className="bg-background">{t}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Сообщение *</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Опишите вашу проблему или вопрос…" className="bg-white/5 border-white/10 text-foreground text-sm min-h-[100px]" />
          </div>

          {user && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input value={user.email || ""} disabled className="bg-white/5 border-white/10 text-muted-foreground text-sm" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Вложения</Label>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="border-white/10 text-foreground text-xs">
              <Upload className="w-3 h-3 mr-1.5" /> Добавить файл
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            Отправить запрос
          </Button>
        </div>
      )}

      {/* FAQ */}
      <div className="space-y-4">
        {filteredCategories.length === 0 && searchQuery && (
          <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
            По запросу «{searchQuery}» ничего не найдено. Попробуйте другой запрос или обратитесь в поддержку.
          </div>
        )}
        {filteredCategories.map((cat, ci) => (
          <div key={ci} className="space-y-1">
            <h3 className="text-sm font-bold text-foreground px-1">{cat.title}</h3>
            <Accordion type="single" collapsible className="space-y-1">
              {cat.items.map((item, i) => (
                <AccordionItem key={i} value={`${ci}-${i}`} className="glass-card rounded-xl border-0 overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 text-sm text-foreground hover:no-underline hover:bg-white/5">{item.q}</AccordionTrigger>
                  <AccordionContent className="px-4 pb-3 text-xs text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      {/* Contacts */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Контакты поддержки</h3>
        <div className="flex flex-col sm:flex-row gap-3 text-sm">
          <a href="mailto:support@buildverse.ai" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Mail className="w-4 h-4" /> support@buildverse.ai
          </a>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" /> Пн–Пт 10:00–18:00 МСК
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Все системы работают в штатном режиме</span>
          </div>
          <button className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            История инцидентов <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
