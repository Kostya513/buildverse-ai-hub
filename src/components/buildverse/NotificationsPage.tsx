import { useState } from "react";
import {
  Bell, Pin, MessageSquare, Home, CreditCard, Handshake, Megaphone,
  Check, Trash2, Settings, Download, ChevronDown, X, Eye,
  AlertTriangle, Clock, Mail, Smartphone, Send as SendIcon,
  Shield, Calendar, FileText, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ───── TYPES ───── */
interface Notification {
  id: string;
  category: Category;
  title: string;
  body: string;
  detail?: string;
  time: string;
  read: boolean;
  pinned: boolean;
  action?: { label: string; target: string };
  group?: number;
}

type Category = "all" | "important" | "messages" | "projects" | "finance" | "partners" | "system";

const categories: { id: Category; label: string; icon: typeof Bell }[] = [
  { id: "all", label: "Все", icon: Bell },
  { id: "important", label: "Важные", icon: Pin },
  { id: "messages", label: "Сообщения", icon: MessageSquare },
  { id: "projects", label: "Проекты", icon: Home },
  { id: "finance", label: "Финансы", icon: CreditCard },
  { id: "partners", label: "Партнёры", icon: Handshake },
  { id: "system", label: "Системные", icon: Megaphone },
];

const categoryColors: Record<Category, string> = {
  all: "text-muted-foreground",
  important: "text-red-400",
  messages: "text-blue-400",
  projects: "text-emerald-400",
  finance: "text-amber-400",
  partners: "text-purple-400",
  system: "text-cyan-400",
};

/* ───── MOCK DATA ───── */
const mockNotifications: Notification[] = [
  { id: "1", category: "important", title: "Требуется верификация профиля", body: "Для доступа к бизнес-функциям необходимо пройти верификацию", time: "5 мин назад", read: false, pinned: true, action: { label: "Верифицировать", target: "settings" } },
  { id: "2", category: "important", title: "Бюджет проекта превышен на 15%", body: "Проект «Дом у озера» — рекомендуем оптимизировать раздел «Отделка»", time: "1 час назад", read: false, pinned: true, action: { label: "Открыть смету", target: "estimate" } },
  { id: "3", category: "important", title: "Гарантия на котёл истекает через 30 дней", body: "Свяжитесь с поставщиком для продления гарантии", time: "2 часа назад", read: false, pinned: false, action: { label: "Открыть паспорт", target: "passport" } },
  { id: "4", category: "messages", title: "Новое сообщение в чате проекта", body: "Подрядчик «ФундаментПро» ответил на вашу заявку", time: "15 мин назад", read: false, pinned: false, action: { label: "Открыть чат", target: "chat" } },
  { id: "5", category: "messages", title: "Вас упомянули в комментарии", body: "Архитектор оставил замечания к чертежу раздела АР", time: "3 часа назад", read: true, pinned: false },
  { id: "6", category: "projects", title: "BIM-модель готова к просмотру", body: "AI-агент завершил генерацию проекта «Дом у озера» — 15 элементов, 3 раздела", time: "30 мин назад", read: false, pinned: false, action: { label: "Открыть проект", target: "projects" } },
  { id: "7", category: "projects", title: "Смета обновлена: +₽150 000", body: "Изменились цены поставщиков в разделе «Кровля»", time: "4 часа назад", read: true, pinned: false, action: { label: "Открыть смету", target: "estimate" } },
  { id: "8", category: "projects", title: "Загружен новый документ", body: "В цифровой паспорт добавлен «Акт скрытых работ №12»", time: "Вчера", read: true, pinned: false },
  { id: "9", category: "finance", title: "Оплата прошла успешно", body: "Тариф Pro активирован. Чек доступен в настройках", time: "2 дня назад", read: true, pinned: false, action: { label: "Скачать чек", target: "tariffs" } },
  { id: "10", category: "finance", title: "Завтра списание за подписку Pro", body: "Сумма: ₽1 990. Убедитесь, что карта активна", detail: "Списание с карты **** 4521", time: "1 день назад", read: false, pinned: false },
  { id: "11", category: "partners", title: "Новая заявка на сотрудничество", body: "ИП Сидоров — специализация: Электромонтаж, Москва и МО", time: "6 часов назад", read: false, pinned: false, action: { label: "Рассмотреть", target: "partners" } },
  { id: "12", category: "partners", title: "Ваш профиль верифицирован", body: "BUILDVERSE подтвердил вашу компанию. Все бизнес-функции доступны", time: "3 дня назад", read: true, pinned: false },
  { id: "13", category: "system", title: "Плановые работы 25.02", body: "Запланированное обслуживание с 02:00 до 04:00 МСК. Возможны кратковременные перебои", time: "5 дней назад", read: true, pinned: false },
  { id: "14", category: "system", title: "Доступна новая версия AI-агента", body: "Улучшена точность расчёта смет и анализа грунтов", time: "1 неделю назад", read: true, pinned: false },
];

/* ───── SETTINGS DEFAULTS ───── */
interface NotifSettings {
  email: boolean;
  push: boolean;
  telegram: boolean;
  whatsapp: boolean;
  frequency: string;
  aiRequests: boolean;
  projectChanges: boolean;
  finance: boolean;
  partners: boolean;
  system: boolean;
  guarantees: boolean;
  actionRequired: boolean;
  quietStart: string;
  quietEnd: string;
}

const defaultSettings: NotifSettings = {
  email: true, push: false, telegram: false, whatsapp: false,
  frequency: "instant",
  aiRequests: true, projectChanges: true, finance: true, partners: true, system: true, guarantees: true, actionRequired: true,
  quietStart: "22:00", quietEnd: "08:00",
};

/* ═══════════════════════════════════════════
   NOTIFICATIONS PAGE
   ═══════════════════════════════════════════ */
interface NotificationsPageProps {
  onNavigate: (id: string) => void;
}

const NotificationsPage = ({ onNavigate }: NotificationsPageProps) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<Category>("all");
  const [sortBy, setSortBy] = useState<"date" | "importance" | "unread">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showCriticalModal, setShowCriticalModal] = useState<Notification | null>(null);
  const [settings, setSettings] = useState<NotifSettings>(defaultSettings);
  const [clearPeriod, setClearPeriod] = useState("week");

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ── Filtering ── */
  const filtered = notifications
    .filter((n) => activeTab === "all" || n.category === activeTab)
    .filter((n) => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.body.toLowerCase().includes(searchQuery.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "importance") return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
    if (sortBy === "unread") return (a.read ? 1 : 0) - (b.read ? 1 : 0);
    return 0; // date — already in order
  });

  /* ── Actions ── */
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.read || n.pinned));
    setShowClearModal(false);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header ── */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-foreground tracking-wide">Уведомления</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Все важные события в одном месте. Настройте фильтры, чтобы видеть только нужное.
        </p>
      </div>

      {/* ── Status bar ── */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {unreadCount > 0 ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              {unreadCount} {unreadCount === 1 ? "новое уведомление" : unreadCount < 5 ? "новых уведомления" : "новых уведомлений"}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Нет новых уведомлений</span>
          )}
        </div>
        <Button size="sm" variant="ghost" className="glass-card text-foreground text-xs" onClick={markAllRead}>
          <Check className="w-3.5 h-3.5 mr-1" /> Отметить все как прочитанные
        </Button>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" className="glass-card text-foreground text-xs" onClick={() => setShowClearModal(true)}>
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Очистить прочитанные
        </Button>
        <Button size="sm" variant="ghost" className="glass-card text-foreground text-xs" onClick={() => setShowSettings(true)}>
          <Settings className="w-3.5 h-3.5 mr-1" /> Настройки
        </Button>
        <Button size="sm" variant="ghost" className="glass-card text-foreground text-xs">
          <Download className="w-3.5 h-3.5 mr-1" /> Экспорт лога
        </Button>
      </div>

      {/* ── Search ── */}
      <div className="glass-card rounded-xl p-2 flex items-center gap-2">
        <Bell className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по уведомлениям…"
          className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 text-sm"
        />
      </div>

      {/* ── Category tabs ── */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const count = cat.id === "all" ? notifications.length : notifications.filter((n) => n.category === cat.id).length;
          const unread = cat.id === "all" ? unreadCount : notifications.filter((n) => n.category === cat.id && !n.read).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all relative
                ${activeTab === cat.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "glass-card text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
            >
              <cat.icon className={`w-3.5 h-3.5 ${activeTab === cat.id ? "text-primary" : categoryColors[cat.id]}`} />
              {cat.label}
              {unread > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-red-500/80 text-[10px] flex items-center justify-center text-white font-bold">
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Sort ── */}
      <div className="flex gap-1.5">
        {([["date", "По дате"], ["importance", "По важности"], ["unread", "По непрочитанным"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              sortBy === key ? "bg-white/10 text-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Notification list ── */}
      {sorted.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Здесь пока пусто. Настройте каналы, чтобы не пропустить важное</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((n) => {
            const CatIcon = categories.find((c) => c.id === n.category)?.icon || Bell;
            return (
              <div
                key={n.id}
                className={`glass-card rounded-xl p-4 transition-all hover:bg-white/5 cursor-pointer group ${
                  !n.read ? "border-l-2 border-l-primary/60" : "opacity-75"
                } ${n.pinned ? "ring-1 ring-amber-500/20" : ""}`}
                onClick={() => { markRead(n.id); if (n.pinned) setShowCriticalModal(n); }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.pinned ? "bg-red-500/20" : "bg-white/5"
                  }`}>
                    <CatIcon className={`w-4 h-4 ${categoryColors[n.category]}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-semibold leading-tight ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.pinned && <Pin className="w-3 h-3 inline mr-1 text-amber-400" />}
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                    {n.detail && <p className="text-[11px] text-muted-foreground/50 mt-1">{n.detail}</p>}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {n.action && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-3 text-[11px] bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                          onClick={(e) => { e.stopPropagation(); markRead(n.id); onNavigate(n.action!.target); }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {n.action.label}
                        </Button>
                      )}
                      {!n.read && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                          onClick={(e) => { e.stopPropagation(); markRead(n.id); }}>
                          <Eye className="w-3 h-3 mr-1" /> Прочитано
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-red-400"
                        onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ SETTINGS MODAL ═══ */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="glass-card border-white/10 text-foreground max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Настройки уведомлений</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Управляйте каналами и частотой получения уведомлений
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Channels */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">Каналы связи</h4>
              <div className="space-y-2">
                {[
                  { key: "platform" as const, icon: Bell, label: "Внутри платформы", desc: "Уведомления в интерфейсе BUILDVERSE", always: true },
                  { key: "email" as const, icon: Mail, label: "Email", desc: "Письма на привязанный email" },
                  { key: "push" as const, icon: Smartphone, label: "Push", desc: "Уведомления в браузере и на мобильном" },
                  { key: "telegram" as const, icon: SendIcon, label: "Telegram", desc: "Уведомления в Telegram-боте" },
                  { key: "whatsapp" as const, icon: MessageSquare, label: "WhatsApp", desc: "Уведомления в WhatsApp" },
                ].map((ch) => (
                  <div key={ch.key} className="flex items-center justify-between glass-card rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <ch.icon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{ch.label}</p>
                        <p className="text-[10px] text-muted-foreground">{ch.desc}</p>
                      </div>
                    </div>
                    {ch.always ? (
                      <span className="text-[10px] text-primary">Всегда вкл</span>
                    ) : (
                      <Switch
                        checked={settings[ch.key as keyof NotifSettings] as boolean}
                        onCheckedChange={(v) => setSettings((s) => ({ ...s, [ch.key]: v }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">Частота получения</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "instant", label: "Мгновенно", desc: "Сразу при событии" },
                  { value: "daily", label: "Ежедневно", desc: "Дайджест утром (9:00)" },
                  { value: "weekly", label: "Еженедельно", desc: "Дайджест по понедельникам" },
                  { value: "never", label: "Никогда", desc: "Полностью отключить" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSettings((s) => ({ ...s, frequency: f.value }))}
                    className={`glass-card rounded-xl p-3 text-left transition-all ${
                      settings.frequency === f.value ? "border border-primary/40 bg-primary/10" : "hover:bg-white/5"
                    }`}
                  >
                    <p className="text-xs font-semibold text-foreground">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Event types */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">По типам событий</h4>
              <div className="space-y-2">
                {[
                  { key: "aiRequests", label: "Завершение AI-запросов" },
                  { key: "projectChanges", label: "Изменения в проектах" },
                  { key: "finance", label: "Финансовые операции" },
                  { key: "partners", label: "Сообщения от партнёров" },
                  { key: "system", label: "Системные обновления" },
                  { key: "guarantees", label: "Истечение гарантий" },
                  { key: "actionRequired", label: "Требуется действие", locked: true },
                ].map((evt) => (
                  <div key={evt.key} className="flex items-center justify-between glass-card rounded-xl px-3 py-2.5">
                    <span className="text-xs text-foreground">{evt.label}</span>
                    {evt.locked ? (
                      <span className="text-[10px] text-primary">Всегда вкл</span>
                    ) : (
                      <Switch
                        checked={settings[evt.key as keyof NotifSettings] as boolean}
                        onCheckedChange={(v) => setSettings((s) => ({ ...s, [evt.key]: v }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quiet hours */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">Тихие часы</h4>
              <div className="glass-card rounded-xl p-3 flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground flex-1">
                  Не беспокоить с {settings.quietStart} до {settings.quietEnd}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-sm" onClick={() => setShowSettings(false)}>
                Сохранить настройки
              </Button>
              <Button variant="ghost" className="glass-card text-muted-foreground text-xs" onClick={() => setSettings(defaultSettings)}>
                Сбросить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ CLEAR MODAL ═══ */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogContent className="glass-card border-white/10 text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Очистить историю уведомлений?</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Будут удалены все прочитанные уведомления за период
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-2">
              {[["week", "За неделю"], ["month", "За месяц"], ["all", "Всё"]].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setClearPeriod(value)}
                  className={`glass-card rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    clearPeriod === value ? "border border-primary/40 bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 glass-card text-foreground text-sm" onClick={() => setShowClearModal(false)}>
                Отмена
              </Button>
              <Button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm" onClick={clearRead}>
                Очистить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ CRITICAL NOTIFICATION MODAL ═══ */}
      <Dialog open={!!showCriticalModal} onOpenChange={() => setShowCriticalModal(null)}>
        <DialogContent className="glass-card border-white/10 text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Требуется ваше действие
            </DialogTitle>
          </DialogHeader>
          {showCriticalModal && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground leading-relaxed">{showCriticalModal.body}</p>
              <div className="flex gap-2">
                {showCriticalModal.action && (
                  <Button
                    className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-sm"
                    onClick={() => { setShowCriticalModal(null); onNavigate(showCriticalModal.action!.target); }}
                  >
                    {showCriticalModal.action.label}
                  </Button>
                )}
                <Button variant="ghost" className="flex-1 glass-card text-foreground text-sm" onClick={() => setShowCriticalModal(null)}>
                  Позже
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsPage;
