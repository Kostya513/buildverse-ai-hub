import { useState } from "react";
import {
  MapPin, Cloud, Mountain, TreePine, Sun, Layers, Plus, Paperclip, Mic, Send,
  MessageSquare, Clock, FolderOpen, Heart, ThumbsUp,
  User, Building2, PenTool, ChevronDown, Sparkles, Eye, Bot, ArrowRight,
  Download, RefreshCw, Share2, Copy, FileText, Settings2,
  ShoppingCart, X, Star, Briefcase, TrendingUp, Filter, Package, Wrench, Truck, Search,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StaticPage from "./StaticPage";
import ProfilePage from "./ProfilePage";
import { useAuth } from "@/hooks/useAuth";
import type { useChats } from "@/hooks/useChats";

/* ───── GEO TABS ───── */
const geoTabs = [
  { id: "climate", label: "Климат", icon: Cloud },
  { id: "soil", label: "Грунт", icon: Layers },
  { id: "relief", label: "Рельеф", icon: Mountain },
  { id: "eco", label: "Экосистема", icon: TreePine },
  { id: "sun", label: "Солнце", icon: Sun },
];

const geoTabContent: Record<string, { title: string; text: string; ai: string }> = {
  climate: {
    title: "Климат региона",
    text: "Снеговая нагрузка до 200 кг/м² — рекомендуем усиленный кровельный контур. Ветровая нагрузка: III район. Среднегодовая температура: +5.2 °C.",
    ai: "💡 СтройМакс: При такой снеговой нагрузке оптимален угол ската от 35°. Рассмотрите металлочерепицу с усиленной обрешёткой.",
  },
  soil: {
    title: "Грунт участка",
    text: "Тип грунта: суглинок средней плотности. УГВ (уровень грунтовых вод): 2.1 м. Несущая способность: 2.5 кг/см². Рекомендация: свайно-ростверковый фундамент.",
    ai: "💡 СтройМакс: Суглинок склонен к пучению. Рекомендую утеплённую шведскую плиту (УШП) или буронабивные сваи.",
  },
  relief: {
    title: "Рельеф и уклон",
    text: "Уклон участка: 3.5° (юго-восток). Перепад высот: 1.8 м на 30 м длины. Рекомендация: террасирование или цокольный этаж.",
    ai: "💡 СтройМакс: Уклон можно использовать для цокольного этажа — экономия до 15% на земляных работах.",
  },
  eco: {
    title: "Экосистема",
    text: "Зона: лесостепь. Охранные зоны: 50 м до водоёма. Деревья: 12 ед. под охраной. Рекомендация: согласование с экологической экспертизой.",
    ai: "💡 СтройМакс: Близость водоёма требует проекта ливневой канализации. Учтите СП 42.13330.",
  },
  sun: {
    title: "Инсоляция и солнце",
    text: "Оптимальная ориентация фасада: юг / юго-восток. Часов солнца летом: 16.2 ч. Потенциал солнечных панелей: высокий (4.8 кВт·ч/м²/день).",
    ai: "💡 СтройМакс: Расположите гостиную и террасу на юг. Спальни — на восток для мягкого утреннего света.",
  },
};

/* ───── SECTION TITLES ───── */
interface CenterZoneProps {
  activeSection: string;
  onRequestAuth: () => void;
  onNavigate: (id: string) => void;
  userRole?: string | null;
  chatHook?: ReturnType<typeof useChats>;
}

const sectionTitles: Record<string, string> = {
  geo: "Геоинтеллект",
  projects: "Мои проекты",
  stroynet: "Стройнет",
  invest: "Инвестиции",
  market: "Маркетплейс",
  contractors: "Подрядчики",
  estimate: "Смета",
  passport: "Цифровой паспорт",
  notifications: "Уведомления",
  profile: "Профиль",
  settings: "Настройки",
  about: "О нас",
  tariffs: "Тарифы",
  partners: "Партнёры",
  privacy: "Конфиденциальность",
  help: "Помощь",
};

/* ═══════════════════════════════════════════
   MESSAGE ACTIONS BAR
   ═══════════════════════════════════════════ */
const MessageActions = () => (
  <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-white/5">
    {[
      { icon: Download, label: "Скачать" },
      { icon: RefreshCw, label: "Перегенерировать" },
      { icon: Share2, label: "Поделиться" },
      { icon: Copy, label: "Скопировать" },
      { icon: FileText, label: "Источники" },
    ].map(({ icon: Icon, label }) => (
      <button
        key={label}
        title={label}
        className="p-1 rounded hover:bg-white/10 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <Icon className="w-3 h-3" />
      </button>
    ))}
  </div>
);

/* ═══════════════════════════════════════════
   AI CHAT (DEFAULT SCREEN)
   ═══════════════════════════════════════════ */

const roleGreetings: Record<string, string> = {
  private: "Помогу спроектировать ваш дом или дачу — от анализа участка до интерьера.",
  selfemployed: "Помогу с вашими строительными проектами — от сметы до подбора материалов.",
  ip: "Помогу собрать пул проектов, сметы и тендеры для вашего бизнеса.",
  ooo: "Помогу собрать пул проектов, сметы и тендеры для вашего бизнеса.",
  supplier: "Помогу подключиться к маркетплейсу и находить клиентов в экосистеме.",
  architect: "Помогу оформить портфолио и работать с 3D-моделями для ваших заказчиков.",
};

interface ChatMessage {
  from: "agent" | "user";
  text: string;
  button?: { label: string; action: string };
}

const AIChatContent = ({ onNavigate, userRole, chatHook }: { onNavigate: (id: string) => void; userRole?: string | null; chatHook?: ReturnType<typeof useChats> }) => {
  const { user } = useAuth();
  const greeting = userRole && roleGreetings[userRole]
    ? roleGreetings[userRole]
    : "Помогу спроектировать дом, оценить участок и собрать смету.";

  const initialMessages: ChatMessage[] = [
    {
      from: "agent",
      text: `Здравствуйте! Я ваш AI-агент BUILDVERSE. ${greeting}\n\nОтветьте на несколько вопросов, и я соберу для вас проект от участка до интерьера:\n\n1. Где находится ваш участок (город/регион)?\n2. Площадь дома (м²) и этажность?\n3. Примерный бюджет?\n4. Готовы использовать типовые решения или хотите максимум индивидуальности?\n5. Насколько важна интеграция с природой и ландшафтом?\n6. Нужен ли дизайн интерьера сразу?`,
    },
  ];

  // Convert DB messages to local format
  const dbMessages: ChatMessage[] = chatHook?.messages?.map((m) => ({
    from: m.role === "user" ? "user" as const : "agent" as const,
    text: m.content,
  })) || [];

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [showModelPicker, setShowModelPicker] = useState(false);

  // Use DB messages if available, otherwise local
  const messages = chatHook?.currentChatId && dbMessages.length > 0 ? dbMessages : localMessages;

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { from: "user", text: input };

    // If logged in and have chatHook, persist
    if (user && chatHook) {
      if (!chatHook.currentChatId) {
        await chatHook.createChat(input.slice(0, 60));
      }
      await chatHook.sendMessage(input, "user");

      // Generate static agent response
      let agentText = "";
      if (step === 0) {
        agentText = "Отлично! Я нашёл ваш регион. Давайте я использую Геоинтеллект, чтобы изучить ваш участок — климат, грунт, рельеф, экологию.";
        setStep(1);
      } else if (step === 1) {
        agentText = "Принял! На основе вашего бюджета я могу подобрать инвестиционные проекты и подрядчиков.";
        setStep(2);
      } else {
        agentText = "Проект можно оформить как цифровой паспорт здания с гарантиями и IoT-данными.";
      }
      await chatHook.sendMessage(agentText, "assistant");
    } else {
      // Local-only for guests
      const newMessages = [...localMessages, userMsg];
      if (step === 0) {
        newMessages.push({
          from: "agent",
          text: "Отлично! Я нашёл ваш регион. Давайте я использую Геоинтеллект, чтобы изучить ваш участок — климат, грунт, рельеф, экологию.",
          button: { label: "Открыть Геоинтеллект", action: "geo" },
        });
        setStep(1);
      } else if (step === 1) {
        newMessages.push({
          from: "agent",
          text: "Принял! На основе вашего бюджета я могу подобрать инвестиционные проекты и подрядчиков.",
          button: { label: "Открыть Подрядчиков", action: "contractors" },
        });
        setStep(2);
      } else {
        newMessages.push({
          from: "agent",
          text: "Проект можно оформить как цифровой паспорт здания с гарантиями и IoT-данными.",
          button: { label: "Создать цифровой паспорт", action: "passport" },
        });
      }
      setLocalMessages(newMessages);
    }
    setInput("");
  };

  const handleChip = (text: string) => setInput(text);

  const chips = [
    "У меня есть участок, хочу дом",
    "Только планирую покупку участка",
    "Я девелопер, мне нужны несколько домов",
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Hero — minimal branding */}
      <div className="text-center mb-6 pt-2">
        <div className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-base font-bold text-foreground tracking-wide">BUILDVERSE AI</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Не просто чат. Это ваш личный AI-архитектор и девелопер.
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-md mx-auto">
          Он анализирует участок, считает смету, подбирает материалы и помогает вписать дом в природу — от фундамента до декора.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-4 mb-3 px-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
              msg.from === "user"
                ? "bg-primary/20 text-foreground ml-4"
                : "bg-white/5 text-muted-foreground mr-4"
            }`}>
              {msg.text}
              {msg.button && (
                <Button
                  size="sm"
                  className="mt-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 w-full"
                  onClick={() => onNavigate(msg.button!.action)}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {msg.button.label}
                </Button>
              )}
              {msg.from === "agent" && <MessageActions />}
            </div>
          </div>
        ))}
      </div>

      {/* Chips */}
      {step === 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 px-1">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => handleChip(c)}
              className="glass-card px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-primary hover:border-primary/30 whitespace-nowrap transition-all"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Universal input bar */}
      <div className="glass-card rounded-2xl p-3 flex items-center gap-2 relative">
        <button className="text-muted-foreground hover:text-primary transition-colors p-1" title="Добавить файл">
          <Paperclip className="w-4 h-4" />
        </button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Опишите задачу или ваш строительный проект…"
          className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-sm"
        />
        {/* Model picker */}
        <div className="relative">
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            className="text-muted-foreground hover:text-primary transition-colors p-1 flex items-center gap-1 text-[10px]"
            title="Выбор модели"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
          {showModelPicker && (
            <div className="absolute bottom-full right-0 mb-2 glass-card rounded-xl p-2 min-w-[140px] space-y-0.5 z-50">
              {["BUILDVERSE Pro", "BUILDVERSE Lite", "BUILDVERSE 3D"].map((m) => (
                <button
                  key={m}
                  onClick={() => setShowModelPicker(false)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-foreground hover:bg-white/10 transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="text-muted-foreground hover:text-primary transition-colors p-1" title="Голосовой ввод">
          <Mic className="w-4 h-4" />
        </button>
        <button onClick={handleSend} className="text-primary hover:text-primary/80 transition-colors p-1" title="Отправить">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   GEO CONTENT
   ═══════════════════════════════════════════ */
const GeoContent = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  const [activeTab, setActiveTab] = useState("climate");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const tab = geoTabContent[activeTab];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-card rounded-xl p-3 border border-primary/20 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Эти данные использует ваш AI-агент, чтобы проект соответствовал климату, грунту и нормам.
        </p>
      </div>

      <div className="glass-card rounded-2xl h-52 md:h-64 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 30% 40%, hsl(var(--primary)) 1px, transparent 1px), radial-gradient(circle at 70% 60%, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="text-center relative z-10">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-2 opacity-80" />
          <p className="text-muted-foreground text-sm">Интерактивная карта участка</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Московская область, Истринский р-н</p>
        </div>
      </div>

      <Button variant="ghost" className="w-full glass-card text-foreground text-sm hover:glass-glow" onClick={() => setShowAnalysis(!showAnalysis)}>
        <Eye className="w-4 h-4 mr-2 text-primary" />
        {showAnalysis ? "Скрыть пример анализа" : "Посмотреть пример анализа участка"}
      </Button>

      {showAnalysis && (
        <div className="glass-card rounded-2xl p-4 space-y-2 animate-fade-in border border-primary/20">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Демо-анализ: Участок 15 соток, Истра
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>🌡 Климат: снеговая нагрузка 180 кг/м², ветер III зона</p>
            <p>🪨 Грунт: суглинок, УГВ 2.1 м → свайно-ростверковый фундамент</p>
            <p>⛰ Рельеф: уклон 3.5° ЮВ → рекомендован цокольный этаж</p>
            <p>☀ Солнце: фасад на юг, потенциал солнечных панелей — высокий</p>
            <p>🌿 Эко: 50 м до водоёма, 12 деревьев под охраной</p>
          </div>
          <p className="text-xs text-primary italic">ИИ-рекомендация: 2-этажный каркасный дом, УШП, ориентация ЮВ</p>
        </div>
      )}

      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {geoTabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all
              ${activeTab === t.id ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-xl p-4 space-y-2 animate-fade-in">
        <h4 className="text-sm font-bold text-foreground">{tab.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{tab.text}</p>
        <p className="text-xs text-primary/80 italic mt-2">{tab.ai}</p>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-2">
        <h4 className="text-sm font-bold text-foreground">Что делает Геоинтеллект</h4>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>🌡 Анализирует климат (температура, снеговая и ветровая нагрузка)</li>
          <li>🪨 Анализирует грунт (тип, УГВ, рекомендации по фундаменту)</li>
          <li>⛰ Учитывает рельеф и уклон участка</li>
          <li>☀ Помогает выбрать ориентацию дома по солнцу</li>
          <li>🌿 Показывает экологические ограничения и возможности</li>
        </ul>
      </div>

      <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => onNavigate("chat")}>
        <Plus className="w-4 h-4 mr-2" />
        Создать проект через AI-агента
      </Button>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MY PROJECTS
   ═══════════════════════════════════════════ */
const projectsMock = [
  { id: 1, name: "Дом в Истре", type: "Дом", status: "В работе", progress: 67 },
  { id: 2, name: "Таунхаус «Сосны»", type: "Таунхаус", status: "Черновик", progress: 15 },
  { id: 3, name: "ЖК «Изумрудный»", type: "ЖК", status: "В работе", progress: 82 },
  { id: 4, name: "Дача в Переделкино", type: "Дом", status: "Завершён", progress: 100 },
];

const ProjectsContent = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "active", "draft", "done"];
  const filterLabels: Record<string, string> = { all: "Все", active: "Активные", draft: "Черновики", done: "Завершённые" };
  const statusMap: Record<string, string> = { active: "В работе", draft: "Черновик", done: "Завершён" };
  const filtered = filter === "all" ? projectsMock : projectsMock.filter((p) => p.status === statusMap[filter]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === f ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground hover:text-foreground"
            }`}>{filterLabels[f]}</button>
        ))}
      </div>
      {filtered.map((p) => (
        <div key={p.id} className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">{p.name}</h4>
              <p className="text-xs text-muted-foreground">{p.type} • {p.status}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              p.status === "В работе" ? "bg-primary/20 text-primary" :
              p.status === "Завершён" ? "bg-green-500/20 text-green-400" :
              "bg-white/10 text-muted-foreground"
            }`}>{p.progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${p.progress}%` }} />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="glass-card text-foreground text-xs flex-1">
              <FolderOpen className="w-3.5 h-3.5 mr-1" /> Открыть
            </Button>
            <Button variant="ghost" size="sm" className="glass-card text-foreground text-xs flex-1" onClick={() => onNavigate("chat")}>
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Чат с ИИ
            </Button>
          </div>
        </div>
      ))}
      <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => onNavigate("chat")}>
        <Plus className="w-4 h-4 mr-2" /> Новый проект
      </Button>
    </div>
  );
};

/* ═══════════════════════════════════════════
   STROYNET (COMMUNITY)
   ═══════════════════════════════════════════ */
const postsMock = [
  { id: 1, author: "Иван Петров", role: "Частный застройщик", icon: User, title: "Какой фундамент выбрать для суглинка?", text: "Участок 12 соток, суглинок, УГВ 1.8 м. Планирую одноэтажный дом 120 м². Свайный или плита?", tags: ["#Фундамент"], likes: 12, replies: 8 },
  { id: 2, author: "ООО «СтройГрад»", role: "Подрядчик", icon: Building2, title: "Ищем заказы на фундаментные работы — МО", text: "Бригада 8 человек, опыт 12 лет. Делаем УШП, свайно-ростверковые, монолитные плиты.", tags: ["#Фундамент", "#Инвестиции"], likes: 5, replies: 3 },
  { id: 3, author: "Анна Сидорова", role: "Архитектор", icon: PenTool, title: "3D-концепт эко-дома с зелёной кровлей", text: "Разработала проект пассивного дома 180 м² с зелёной кровлей и солнечными панелями.", tags: ["#Эко", "#УмныйДом"], likes: 24, replies: 15 },
  { id: 4, author: "Дмитрий Козлов", role: "Самозанятый", icon: User, title: "Опыт установки умного дома на базе Zigbee", text: "Поставил 40 датчиков, автоматизировал отопление и освещение. Экономия 30% на электричестве.", tags: ["#УмныйДом"], likes: 18, replies: 11 },
];

const channels = ["Все", "#Фундамент", "#УмныйДом", "#Эко", "#Инвестиции"];

const StroynetContent = ({ onRequestAuth }: { onRequestAuth: () => void }) => {
  const [channel, setChannel] = useState("Все");
  const filtered = channel === "Все" ? postsMock : postsMock.filter((p) => p.tags.includes(channel));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {channels.map((c) => (
          <button key={c} onClick={() => setChannel(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              channel === c ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground hover:text-foreground"
            }`}>{c}</button>
        ))}
      </div>
      <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={onRequestAuth}>
        <Plus className="w-4 h-4 mr-2" /> Создать пост
        <span className="ml-auto text-[10px] text-muted-foreground">Только для зарегистрированных</span>
      </Button>
      {filtered.map((post) => (
        <div key={post.id} className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <post.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{post.author}</p>
              <p className="text-[11px] text-muted-foreground">{post.role}</p>
            </div>
          </div>
          <h4 className="text-sm font-bold text-foreground">{post.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{post.text}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <MessageSquare className="w-3.5 h-3.5" /> {post.replies}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MARKETPLACE
   ═══════════════════════════════════════════ */
const marketProducts = [
  { id: 1, name: "Арматура А500С ø12", category: "Материалы", price: 48500, desc: "Стержневая, ГОСТ 34028-2016, 1 тонна", manufacturer: "МеталлПром", region: "Москва", specs: [["Тип", "Стержневая"], ["Класс", "А500С"], ["Диаметр", "12 мм"], ["ГОСТ", "34028-2016"]] },
  { id: 2, name: "Экскаватор-погрузчик JCB 3CX", category: "Техника", price: 15000, desc: "Аренда, смена 8 ч, с оператором", manufacturer: "ТехноРент", region: "МО", specs: [["Тип", "Аренда"], ["Смена", "8 часов"], ["Оператор", "Включён"]] },
  { id: 3, name: "Дверная фурнитура Morelli DIY", category: "Фурнитура", price: 3200, desc: "Комплект: петли + ручка + замок, матовый хром", manufacturer: "Morelli", region: "Россия", specs: [["Покрытие", "Матовый хром"], ["Комплект", "Петли + ручка + замок"]] },
  { id: 4, name: "Диван угловой «Скандинавия»", category: "Мебель", price: 89900, desc: "Рогожка, 280×180 см, с ящиком для белья", manufacturer: "МебельГрад", region: "СПб", specs: [["Размер", "280×180 см"], ["Материал", "Рогожка"], ["Ящик", "Есть"]] },
  { id: 5, name: "Декоративная штукатурка Silk Plaster", category: "Декор", price: 2100, desc: "Жидкие обои, 1 упаковка ≈ 3.5 м²", manufacturer: "Silk Plaster", region: "Россия", specs: [["Расход", "3.5 м²/уп"], ["Тип", "Жидкие обои"]] },
  { id: 6, name: "Котёл газовый Baxi ECO", category: "Коммуникации", price: 67800, desc: "24 кВт, двухконтурный, настенный", manufacturer: "Baxi", region: "Италия", specs: [["Мощность", "24 кВт"], ["Тип", "Двухконтурный"], ["Монтаж", "Настенный"]] },
];

const marketCategories = ["Все", "Материалы", "Техника", "Фурнитура", "Мебель", "Декор", "Коммуникации"];
const marketRegions = ["Все регионы", "Москва", "МО", "СПб", "Россия", "Италия"];

type CartItem = { id: number; name: string; price: number };

const MarketplaceContent = () => {
  const [category, setCategory] = useState("Все");
  const [region, setRegion] = useState("Все регионы");
  const [aiFilter, setAiFilter] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<typeof marketProducts[0] | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [addProductDone, setAddProductDone] = useState(false);

  const filtered = marketProducts.filter((p) => {
    if (category !== "Все" && p.category !== category) return false;
    if (region !== "Все регионы" && p.region !== region) return false;
    return true;
  });

  const addToCart = (p: typeof marketProducts[0]) => {
    if (!cart.find((c) => c.id === p.id)) {
      setCart([...cart, { id: p.id, name: p.name, price: p.price }]);
    }
  };

  const removeFromCart = (id: number) => setCart(cart.filter((c) => c.id !== id));
  const total = cart.reduce((s, c) => s + c.price, 0);

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        AI‑агент BUILDVERSE подбирает товары под ваш проект, регион и бюджет.
      </p>

      {/* Filters */}
      <div className="glass-card rounded-xl p-3 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {marketCategories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${category === c ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={region} onChange={(e) => setRegion(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground">
            {marketRegions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Checkbox checked={aiFilter} onCheckedChange={(v) => setAiFilter(!!v)} />
            Подходит для моего проекта
          </label>
        </div>
        {aiFilter && <p className="text-[10px] text-muted-foreground/50">AI‑агент подбирает товары под ваш проект (регион, тип дома, бюджет).</p>}
      </div>

      <Button variant="ghost" size="sm" className="glass-card text-primary text-xs" onClick={() => { setShowAddProduct(true); setAddProductDone(false); }}>
        <Plus className="w-3.5 h-3.5 mr-1" /> Добавить товар (для поставщиков)
      </Button>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="glass-card rounded-xl p-4 space-y-2 cursor-pointer hover:border-primary/30 transition-all" onClick={() => setSelectedProduct(p)}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">{p.name}</h4>
                <p className="text-[11px] text-muted-foreground">{p.category}</p>
              </div>
              <span className="text-sm font-bold text-primary">{p.price.toLocaleString("ru")} ₽</span>
            </div>
            <p className="text-xs text-muted-foreground">{p.desc}</p>
            <Button size="sm" className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs"
              onClick={(e) => { e.stopPropagation(); addToCart(p); }}>
              <ShoppingCart className="w-3.5 h-3.5 mr-1" /> В корзину
            </Button>
          </div>
        ))}
      </div>

      {/* Mini cart */}
      {cart.length > 0 && (
        <div className="glass-card rounded-xl p-4 space-y-2 border border-primary/20">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-primary" /> Корзина</h4>
          {cart.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-xs">
              <span className="text-foreground">{c.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-primary">{c.price.toLocaleString("ru")} ₽</span>
                <button onClick={() => removeFromCart(c.id)} className="text-muted-foreground hover:text-red-400"><X className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-bold">
            <span className="text-foreground">Итого:</span>
            <span className="text-primary">{total.toLocaleString("ru")} ₽</span>
          </div>
          <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs" onClick={() => setShowOrder(true)}>
            Оформить заказ
          </Button>
        </div>
      )}

      {/* Product modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-md">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">{selectedProduct.name}</DialogTitle>
                <DialogDescription>{selectedProduct.category} • {selectedProduct.region}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-2xl font-bold text-primary">{selectedProduct.price.toLocaleString("ru")} ₽</p>
                <p className="text-sm text-muted-foreground">{selectedProduct.desc}</p>
                <div className="space-y-1">
                  {selectedProduct.specs.map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-foreground">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Производитель</span>
                    <span className="text-foreground">{selectedProduct.manufacturer}</span>
                  </div>
                </div>
                <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                  <ShoppingCart className="w-4 h-4 mr-2" /> В корзину
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order modal */}
      <Dialog open={showOrder} onOpenChange={setShowOrder}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Оформление заказа (демо)</DialogTitle>
            <DialogDescription>Ваш заказ сформирован. В полнофункциональной версии вы сможете выбрать адрес, оплату и отслеживать статус.</DialogDescription>
          </DialogHeader>
          <Button variant="ghost" className="w-full glass-card text-foreground" onClick={() => setShowOrder(false)}>Закрыть</Button>
        </DialogContent>
      </Dialog>

      {/* Add product modal */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Новый товар</DialogTitle>
            <DialogDescription>Добавьте товар в маркетплейс BUILDVERSE</DialogDescription>
          </DialogHeader>
          {addProductDone ? (
            <div className="text-center py-4">
              <p className="text-primary font-bold">✓ Товар добавлен (демо)</p>
              <Button variant="ghost" className="mt-3 glass-card text-foreground" onClick={() => setShowAddProduct(false)}>Закрыть</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {[["Название товара", "text"], ["Цена (₽)", "number"], ["Краткое описание", "text"], ["Регион поставки", "text"]].map(([label, type]) => (
                <div key={label} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input type={type} className="bg-white/5 border-white/10 text-foreground" />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Категория</Label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                  {marketCategories.filter((c) => c !== "Все").map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Фото</Label>
                <div className="glass-card rounded-lg p-4 text-center text-xs text-muted-foreground border-dashed border border-white/20">
                  <Package className="w-6 h-6 mx-auto mb-1 text-muted-foreground/40" />
                  Загрузка фото (демо)
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => setAddProductDone(true)}>Сохранить</Button>
                <Button variant="ghost" className="flex-1 glass-card text-foreground" onClick={() => setShowAddProduct(false)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ═══════════════════════════════════════════
   INVESTMENTS
   ═══════════════════════════════════════════ */
const investProjects = [
  { id: 1, name: 'ЖК «Зелёный квартал»', type: "ЖК", region: "Москва", budget: "2.4 млрд ₽", status: "Ищут инвестора", progress: 65 },
  { id: 2, name: 'ТЦ «Галактика»', type: "ТЦ", region: "СПб", budget: "890 млн ₽", status: "Строится", progress: 42 },
  { id: 3, name: "Коттеджный посёлок «Сосны»", type: "Инфраструктура", region: "МО", budget: "450 млн ₽", status: "Ищут подрядчика", progress: 20 },
  { id: 4, name: 'Бизнес-центр «Горизонт»', type: "ТЦ", region: "Казань", budget: "1.1 млрд ₽", status: "Готов", progress: 100 },
];

const investTypes = ["Все", "ЖК", "ТЦ", "Инфраструктура"];
const investStatuses = ["Все", "Ищут инвестора", "Ищут подрядчика", "Строится", "Готов"];
const investRegions = ["Все", "Москва", "МО", "СПб", "Казань"];

const InvestContent = () => {
  const [typeF, setTypeF] = useState("Все");
  const [statusF, setStatusF] = useState("Все");
  const [regionF, setRegionF] = useState("Все");
  const [showCreate, setShowCreate] = useState(false);
  const [createDone, setCreateDone] = useState(false);
  const [applyTo, setApplyTo] = useState<typeof investProjects[0] | null>(null);
  const [applyDone, setApplyDone] = useState(false);

  const filtered = investProjects.filter((p) => {
    if (typeF !== "Все" && p.type !== typeF) return false;
    if (statusF !== "Все" && p.status !== statusF) return false;
    if (regionF !== "Все" && p.region !== regionF) return false;
    return true;
  });

  const statusColor = (s: string) => {
    if (s === "Ищут инвестора") return "bg-yellow-500/20 text-yellow-400";
    if (s === "Ищут подрядчика") return "bg-blue-500/20 text-blue-400";
    if (s === "Строится") return "bg-primary/20 text-primary";
    return "bg-green-500/20 text-green-400";
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        AI‑агент BUILDVERSE может подобрать проекты под ваш бюджет и регион.
      </p>

      {/* Filters */}
      <div className="glass-card rounded-xl p-3 flex items-center gap-2 flex-wrap">
        <select value={regionF} onChange={(e) => setRegionF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground">
          {investRegions.map((r) => <option key={r} value={r}>{r === "Все" ? "Регион" : r}</option>)}
        </select>
        <select value={typeF} onChange={(e) => setTypeF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground">
          {investTypes.map((t) => <option key={t} value={t}>{t === "Все" ? "Тип проекта" : t}</option>)}
        </select>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground">
          {investStatuses.map((s) => <option key={s} value={s}>{s === "Все" ? "Статус" : s}</option>)}
        </select>
      </div>

      <Button variant="ghost" size="sm" className="glass-card text-primary text-xs" onClick={() => { setShowCreate(true); setCreateDone(false); }}>
        <Plus className="w-3.5 h-3.5 mr-1" /> Создать проект / тендер
      </Button>

      {/* Project cards */}
      {filtered.map((p) => (
        <div key={p.id} className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground">{p.name}</h4>
              <p className="text-[11px] text-muted-foreground">{p.type} • {p.region}</p>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>{p.status}</span>
          </div>
          <p className="text-lg font-bold text-primary">{p.budget}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Собрано</span><span>{p.progress}%</span>
            </div>
            <Progress value={p.progress} className="h-1.5" />
          </div>
          <Button size="sm" className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs"
            onClick={() => { setApplyTo(p); setApplyDone(false); }}>
            <Briefcase className="w-3.5 h-3.5 mr-1" /> Подать заявку
          </Button>
        </div>
      ))}

      {/* Create project modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Новый проект / тендер</DialogTitle>
            <DialogDescription>Создайте инвестиционный проект в экосистеме BUILDVERSE</DialogDescription>
          </DialogHeader>
          {createDone ? (
            <div className="text-center py-4">
              <p className="text-primary font-bold">✓ Проект добавлен (демо)</p>
              <Button variant="ghost" className="mt-3 glass-card text-foreground" onClick={() => setShowCreate(false)}>Закрыть</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {[["Название проекта", "text"], ["Локация", "text"], ["Бюджет (₽)", "number"], ["Краткое описание", "text"]].map(([label, type]) => (
                <div key={label} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input type={type} className="bg-white/5 border-white/10 text-foreground" />
                </div>
              ))}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Тип</Label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                  {investTypes.filter((t) => t !== "Все").map((t) => <option key={t}>{t}</option>)}
                  <option>Другое</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Статус</Label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                  <option>Ищут инвестора</option>
                  <option>Ищут подрядчика</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Привязать к проекту</Label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                  <option>Нет проектов</option>
                  <option>Дом в Истре</option>
                  <option>Таунхаус «Сосны»</option>
                  <option>ЖК «Изумрудный»</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => setCreateDone(true)}>Создать</Button>
                <Button variant="ghost" className="flex-1 glass-card text-foreground" onClick={() => setShowCreate(false)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Apply modal */}
      <Dialog open={!!applyTo} onOpenChange={() => setApplyTo(null)}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Заявка на участие</DialogTitle>
            <DialogDescription>{applyTo?.name}</DialogDescription>
          </DialogHeader>
          {applyDone ? (
            <div className="text-center py-4">
              <p className="text-primary font-bold">✓ Заявка отправлена (демо)</p>
              <Button variant="ghost" className="mt-3 glass-card text-foreground" onClick={() => setApplyTo(null)}>Закрыть</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Роль</Label>
                <div className="flex gap-2">
                  {["Инвестор", "Подрядчик"].map((r) => (
                    <button key={r} className="flex-1 glass-card px-3 py-2 rounded-lg text-xs text-foreground hover:bg-primary/10 transition-colors">{r}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Сумма (₽)</Label>
                <Input type="number" className="bg-white/5 border-white/10 text-foreground" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Комментарий</Label>
                <Input className="bg-white/5 border-white/10 text-foreground" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => setApplyDone(true)}>Отправить заявку</Button>
                <Button variant="ghost" className="flex-1 glass-card text-foreground" onClick={() => setApplyTo(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ═══════════════════════════════════════════
   CONTRACTORS
   ═══════════════════════════════════════════ */
const contractorsMock = [
  { id: 1, name: "ООО «ФундаментПро»", rating: 4.9, reviews: 87, tags: ["Фундамент", "Земляные работы"], region: "Москва", online: true, about: "Специализируемся на монолитных фундаментах и свайных полях. 15 лет на рынке, 400+ объектов.", specs: ["Монолитный фундамент", "УШП", "Свайное поле", "Земляные работы"], portfolio: ["Коттедж 250 м², Истра", "ЖК «Сосны», 12 домов", "Склад 1200 м², Химки", "Таунхаус 180 м², Одинцово"], reviewsList: [{ author: "Алексей К.", text: "Отличная работа, фундамент без нареканий 5 лет." }, { author: "Ирина М.", text: "Быстро, качественно, по смете." }] },
  { id: 2, name: "СК «МонолитСтрой»", rating: 4.7, reviews: 56, tags: ["Каркас", "Коробка"], region: "МО", online: true, about: "Строим коробки домов из газобетона и монолитного каркаса. Гарантия 10 лет.", specs: ["Газобетон", "Монолитный каркас", "Кирпичная кладка"], portfolio: ["Дом 320 м², Красногорск", "Дуплекс 200 м², Мытищи", "Коттедж 180 м², Домодедово"], reviewsList: [{ author: "Пётр В.", text: "Построили коробку за 3 месяца, доволен результатом." }, { author: "Ольга С.", text: "Профессиональная команда, рекомендую." }] },
  { id: 3, name: "ИП Сидоров — Инженерия", rating: 4.8, reviews: 34, tags: ["Инженерия", "Отопление"], region: "СПб", online: false, about: "Проектирование и монтаж инженерных систем: отопление, водоснабжение, канализация, вентиляция.", specs: ["Отопление", "Водоснабжение", "Канализация", "Вентиляция"], portfolio: ["Коттедж 280 м², Пушкин", "Таунхаус 150 м², Ломоносов"], reviewsList: [{ author: "Дмитрий Л.", text: "Грамотный подход к проектированию, всё работает идеально." }] },
  { id: 4, name: "«АртОтделка»", rating: 4.6, reviews: 42, tags: ["Отделка", "Декор"], region: "Москва", online: true, about: "Премиальная чистовая отделка и декор интерьеров. Работаем с дизайнерами и архитекторами.", specs: ["Штукатурка", "Покраска", "Плитка", "Паркет", "Декоративные покрытия"], portfolio: ["Пентхаус 200 м², Москва-Сити", "Квартира 120 м², Хамовники", "Загородный дом 350 м², Рублёвка", "Ресторан 180 м², Патрики"], reviewsList: [{ author: "Наталья Р.", text: "Безупречная отделка, внимание к деталям." }, { author: "Сергей К.", text: "Дорого, но стоит каждого рубля." }] },
];

const contractorRegions = ["Все", "Москва", "МО", "СПб"];
const contractorWorkTypes = ["Все", "Фундамент", "Каркас", "Коробка", "Инженерия", "Отделка", "Декор"];
const contractorRatings = ["Любой", "4.0+", "4.5+", "4.8+"];

const ContractorsContent = () => {
  const [regionF, setRegionF] = useState("Все");
  const [workF, setWorkF] = useState("Все");
  const [ratingF, setRatingF] = useState("Любой");
  const [profile, setProfile] = useState<typeof contractorsMock[0] | null>(null);
  const [inviteTo, setInviteTo] = useState<typeof contractorsMock[0] | null>(null);
  const [inviteDone, setInviteDone] = useState(false);

  const minRating = ratingF === "4.0+" ? 4.0 : ratingF === "4.5+" ? 4.5 : ratingF === "4.8+" ? 4.8 : 0;

  const filtered = contractorsMock.filter((c) => {
    if (regionF !== "Все" && c.region !== regionF) return false;
    if (workF !== "Все" && !c.tags.includes(workF)) return false;
    if (c.rating < minRating) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        AI‑агент может рекомендовать подрядчиков под ваш проект и бюджет.
      </p>

      {/* Filters */}
      <div className="glass-card rounded-xl p-3 flex items-center gap-2 flex-wrap">
        <select value={regionF} onChange={(e) => setRegionF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground">
          {contractorRegions.map((r) => <option key={r} value={r}>{r === "Все" ? "Регион" : r}</option>)}
        </select>
        <select value={workF} onChange={(e) => setWorkF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground">
          {contractorWorkTypes.map((w) => <option key={w} value={w}>{w === "Все" ? "Тип работ" : w}</option>)}
        </select>
        <select value={ratingF} onChange={(e) => setRatingF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground">
          {contractorRatings.map((r) => <option key={r} value={r}>{r === "Любой" ? "Мин. рейтинг" : r}</option>)}
        </select>
      </div>

      {/* Contractor cards */}
      {filtered.map((c) => (
        <div key={c.id} className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground truncate">{c.name}</h4>
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.online ? "bg-green-400" : "bg-muted-foreground/40"}`} title={c.online ? "Онлайн" : "Офлайн"} />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-foreground">{c.rating}</span>
                <span className="text-[11px] text-muted-foreground">/ {c.reviews} отзывов</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {c.tags.map((t) => (
              <span key={t} className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{t}</span>
            ))}
            <span className="text-[11px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">{c.region}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 glass-card text-foreground text-xs" onClick={() => setProfile(c)}>
              <Eye className="w-3.5 h-3.5 mr-1" /> Профиль
            </Button>
            <Button size="sm" className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs" onClick={() => { setInviteTo(c); setInviteDone(false); }}>
              <Send className="w-3.5 h-3.5 mr-1" /> Пригласить
            </Button>
          </div>
        </div>
      ))}

      {/* Profile modal */}
      <Dialog open={!!profile} onOpenChange={() => setProfile(null)}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-md max-h-[80vh] overflow-y-auto">
          {profile && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"><Wrench className="w-4 h-4 text-primary" /></div>
                  {profile.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {profile.rating} • {profile.reviews} отзывов • {profile.region}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-foreground mb-1">О компании</h5>
                  <p className="text-xs text-muted-foreground">{profile.about}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-foreground mb-1">Специализация</h5>
                  <div className="flex gap-1.5 flex-wrap">
                    {profile.specs.map((s) => <span key={s} className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-foreground mb-1">Портфолио</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {profile.portfolio.map((p, i) => (
                      <div key={i} className="glass-card rounded-lg p-2 text-xs text-muted-foreground">{p}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-foreground mb-1">Отзывы</h5>
                  {profile.reviewsList.map((r, i) => (
                    <div key={i} className="glass-card rounded-lg p-3 mb-2">
                      <p className="text-xs font-medium text-foreground">{r.author}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.text}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => { setProfile(null); setInviteTo(profile); setInviteDone(false); }}>
                  <Send className="w-4 h-4 mr-2" /> Пригласить в проект
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite modal */}
      <Dialog open={!!inviteTo} onOpenChange={() => setInviteTo(null)}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Приглашение подрядчика</DialogTitle>
            <DialogDescription>{inviteTo?.name}</DialogDescription>
          </DialogHeader>
          {inviteDone ? (
            <div className="text-center py-4">
              <p className="text-primary font-bold">✓ Приглашение отправлено (демо)</p>
              <Button variant="ghost" className="mt-3 glass-card text-foreground" onClick={() => setInviteTo(null)}>Закрыть</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Проект</Label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                  <option>Дом в Истре</option>
                  <option>Таунхаус «Сосны»</option>
                  <option>ЖК «Изумрудный»</option>
                  <option>Дача в Переделкино</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Тип работ</Label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                  {contractorWorkTypes.filter((w) => w !== "Все").map((w) => <option key={w}>{w}</option>)}
                </select>
              </div>
              {[["Бюджет / диапазон (₽)", "text"], ["Сроки", "text"], ["Комментарий", "text"]].map(([label, type]) => (
                <div key={label} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input type={type} className="bg-white/5 border-white/10 text-foreground" />
                </div>
              ))}
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => setInviteDone(true)}>Отправить приглашение</Button>
                <Button variant="ghost" className="flex-1 glass-card text-foreground" onClick={() => setInviteTo(null)}>Отмена</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ═══════════════════════════════════════════
   PLACEHOLDER FOR OTHER SECTIONS
   ═══════════════════════════════════════════ */
const PlaceholderContent = ({ section }: { section: string }) => {
  const items: Record<string, string[]> = {
    estimate: ["Фундамент: 2.1 млн ₽", "Каркас: 4.8 млн ₽", "Итого: 12.4 млн ₽"],
    passport: ["IoT датчиков: 24", "Гарантия до: 2030", "QR: сгенерирован"],
    notifications: ["Системных: 3", "Сообщество: 7", "ИИ-рекомендации: 2"],
  };
  return (
    <div className="space-y-3 animate-fade-in">
      {(items[section] || []).map((item, i) => (
        <div key={i} className="glass-card rounded-xl px-4 py-3 text-sm text-foreground">{item}</div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   CENTER ZONE (MAIN)
   ═══════════════════════════════════════════ */
const CenterZone = ({ activeSection, onRequestAuth, onNavigate, userRole, chatHook }: CenterZoneProps) => {
  const staticPages = ["about", "tariffs", "partners", "privacy", "help"];

  const renderContent = () => {
    if (staticPages.includes(activeSection)) {
      return <StaticPage slug={activeSection} />;
    }
    if (activeSection === "profile") return <ProfilePage />;
    if (activeSection === "settings") return <ProfilePage />;

    switch (activeSection) {
      case "chat": return <AIChatContent onNavigate={onNavigate} userRole={userRole} chatHook={chatHook} />;
      case "geo": return <GeoContent onNavigate={onNavigate} />;
      case "projects": return <ProjectsContent onNavigate={onNavigate} />;
      case "stroynet": return <StroynetContent onRequestAuth={onRequestAuth} />;
      case "market": return <MarketplaceContent />;
      case "invest": return <InvestContent />;
      case "contractors": return <ContractorsContent />;
      default: return <PlaceholderContent section={activeSection} />;
    }
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-3">
      {activeSection !== "chat" && (
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-foreground">
            {sectionTitles[activeSection] || activeSection}
          </h2>
          <button
            onClick={() => onNavigate("chat")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            Вернуться в чат
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {renderContent()}
      </div>
    </div>
  );
};

export default CenterZone;
