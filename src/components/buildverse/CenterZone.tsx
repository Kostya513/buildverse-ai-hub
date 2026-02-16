import { useState } from "react";
import {
  MapPin, Cloud, Mountain, TreePine, Sun, Layers, Plus, Paperclip, Mic, Send,
  MessageSquare, Clock, Wand2, Search, Filter, FolderOpen, Heart, ThumbsUp,
  User, Building2, PenTool, ChevronRight, Sparkles, Eye, Bot, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
}

const sectionTitles: Record<string, string> = {
  chat: "AI-агент BUILDVERSE",
  geo: "Геоинтеллект",
  projects: "Мои проекты",
  stroynet: "Стройнет",
  invest: "Инвестиции",
  market: "Маркетплейс",
  contractors: "Подрядчики",
  estimate: "Смета",
  stroymax: "СтройМакс AI",
  passport: "Цифровой паспорт",
  notifications: "Уведомления",
};

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

const AIChatContent = ({ onNavigate, userRole }: { onNavigate: (id: string) => void; userRole?: string | null }) => {
  const greeting = userRole && roleGreetings[userRole]
    ? roleGreetings[userRole]
    : "Помогу спроектировать дом, оценить участок и собрать смету.";

  const initialMessages: ChatMessage[] = [
    {
      from: "agent",
      text: `Здравствуйте! Я ваш AI-агент BUILDVERSE. ${greeting}\n\nОтветьте на несколько вопросов:\n\n1. Где находится ваш участок (город/регион)?\n2. Площадь дома (м²) и этажность?\n3. Примерный бюджет (₽ или $)?\n4. Важно ли использовать готовые решения или хотите максимум индивидуальности?\n5. Нужен ли дизайн интерьера сразу?`,
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0); // 0=initial, 1=user answered, 2=agent replied with geo

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { from: "user", text: input };
    const newMessages = [...messages, userMsg];

    if (step === 0) {
      newMessages.push({
        from: "agent",
        text: "Отлично! Я нашёл ваш регион. Давайте посмотрим данные по участку — климат, грунт, рельеф и экологию. Это поможет подобрать оптимальный проект.",
        button: { label: "Открыть Геоинтеллект", action: "geo" },
      });
      setStep(1);
    } else {
      newMessages.push({
        from: "agent",
        text: "Принял! Анализирую данные и подготовлю рекомендации. Вы можете переключиться на нужный модуль в левой панели или продолжить диалог здесь.",
      });
    }

    setMessages(newMessages);
    setInput("");
  };

  const handleChip = (text: string) => {
    setInput(text);
  };

  const chips = [
    "У меня есть участок, хочу дом",
    "Только планирую покупку участка",
    "Я девелопер, мне нужны несколько домов",
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">BUILDVERSE — ваш AI-агент для строительства</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Не просто чат. Это ваш личный AI-архитектор и девелопер.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-md mx-auto">
          Он анализирует участок, считает смету, подбирает материалы и помогает вписать дом в природу — от фундамента до декора.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-3 mb-3">
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
            </div>
          </div>
        ))}
      </div>

      {/* Chips */}
      {step === 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
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

      {/* Input bar */}
      <div className="glass-card rounded-2xl p-3 flex items-center gap-2">
        <button className="text-muted-foreground hover:text-primary transition-colors p-1">
          <Paperclip className="w-4 h-4" />
        </button>
        <button className="text-muted-foreground hover:text-primary transition-colors p-1">
          <Mic className="w-4 h-4" />
        </button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Опишите ваш участок и дом, который хотите…"
          className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-sm"
        />
        <button onClick={handleSend} className="text-primary hover:text-primary/80 transition-colors p-1">
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
      {/* Note */}
      <div className="glass-card rounded-xl p-3 border border-primary/20 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Эти данные использует ваш AI-агент, чтобы проект соответствовал климату, грунту и нормам.{" "}
          <button onClick={() => onNavigate("chat")} className="text-primary hover:underline">Вернуться в чат →</button>
        </p>
      </div>

      {/* Map */}
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

      {/* Demo analysis button */}
      <Button
        variant="ghost"
        className="w-full glass-card text-foreground text-sm hover:glass-glow"
        onClick={() => setShowAnalysis(!showAnalysis)}
      >
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

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {geoTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all
              ${activeTab === t.id ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="glass-card rounded-xl p-4 space-y-2 animate-fade-in">
        <h4 className="text-sm font-bold text-foreground">{tab.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{tab.text}</p>
        <p className="text-xs text-primary/80 italic mt-2">{tab.ai}</p>
      </div>

      {/* What is Geo */}
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

      {/* Create project → opens chat */}
      <Button
        className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
        onClick={() => onNavigate("chat")}
      >
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
            }`}
          >{filterLabels[f]}</button>
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

      <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
        onClick={() => onNavigate("chat")}>
        <Plus className="w-4 h-4 mr-2" /> Новый проект
      </Button>
    </div>
  );
};

/* ═══════════════════════════════════════════
   STROYNET (COMMUNITY)
   ═══════════════════════════════════════════ */
const postsMock = [
  {
    id: 1, author: "Иван Петров", role: "Частный застройщик", icon: User,
    title: "Какой фундамент выбрать для суглинка?",
    text: "Участок 12 соток, суглинок, УГВ 1.8 м. Планирую одноэтажный дом 120 м². Свайный или плита?",
    tags: ["#Фундамент"], likes: 12, replies: 8,
  },
  {
    id: 2, author: "ООО «СтройГрад»", role: "Подрядчик", icon: Building2,
    title: "Ищем заказы на фундаментные работы — МО",
    text: "Бригада 8 человек, опыт 12 лет. Делаем УШП, свайно-ростверковые, монолитные плиты.",
    tags: ["#Фундамент", "#Инвестиции"], likes: 5, replies: 3,
  },
  {
    id: 3, author: "Анна Сидорова", role: "Архитектор", icon: PenTool,
    title: "3D-концепт эко-дома с зелёной кровлей",
    text: "Разработала проект пассивного дома 180 м² с зелёной кровлей и солнечными панелями.",
    tags: ["#Эко", "#УмныйДом"], likes: 24, replies: 15,
  },
  {
    id: 4, author: "Дмитрий Козлов", role: "Самозанятый", icon: User,
    title: "Опыт установки умного дома на базе Zigbee",
    text: "Поставил 40 датчиков, автоматизировал отопление и освещение. Экономия 30% на электричестве.",
    tags: ["#УмныйДом"], likes: 18, replies: 11,
  },
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
            }`}
          >{c}</button>
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
   PLACEHOLDER FOR OTHER SECTIONS
   ═══════════════════════════════════════════ */
const PlaceholderContent = ({ section }: { section: string }) => {
  const items: Record<string, string[]> = {
    invest: ["ЖК «Изумрудный» — 2.4 млрд ₽", "ТЦ «Галактика» — 890 млн ₽", "Тендеры: 14 активных"],
    market: ["Избранное: 7 товаров", "Акции: -15% на арматуру", "Коммерческие предложения: 3"],
    contractors: ["Рядом: 12 подрядчиков", "Средний рейтинг: 4.7★", "Приглашения: 2 активных"],
    estimate: ["Фундамент: 2.1 млн ₽", "Каркас: 4.8 млн ₽", "Итого: 12.4 млн ₽"],
    stroymax: ["Быстрые команды AI", "Анализ чертежей", "Оптимизация расходов"],
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
const CenterZone = ({ activeSection, onRequestAuth, onNavigate, userRole }: CenterZoneProps) => {
  const renderContent = () => {
    switch (activeSection) {
      case "chat": return <AIChatContent onNavigate={onNavigate} userRole={userRole} />;
      case "geo": return <GeoContent onNavigate={onNavigate} />;
      case "projects": return <ProjectsContent onNavigate={onNavigate} />;
      case "stroynet": return <StroynetContent onRequestAuth={onRequestAuth} />;
      default: return <PlaceholderContent section={activeSection} />;
    }
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      {activeSection !== "chat" && (
        <h2 className="text-lg font-bold text-foreground px-1">
          {sectionTitles[activeSection] || activeSection}
        </h2>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {renderContent()}
      </div>

      {/* Persistent mini-chat hint for non-chat sections */}
      {activeSection !== "chat" && (
        <button
          onClick={() => onNavigate("chat")}
          className="glass-card rounded-2xl p-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Bot className="w-4 h-4 text-primary" />
          <span>Вернуться к AI-агенту</span>
          <ArrowRight className="w-3.5 h-3.5 ml-auto" />
        </button>
      )}
    </div>
  );
};

export default CenterZone;
