import { useState } from "react";
import {
  MapPin, Cloud, Mountain, TreePine, Sun, Layers, Plus, Paperclip, Send,
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
import SettingsPage from "./SettingsPage";
import PartnersPage from "./PartnersPage";
import PrivacyPage from "./PrivacyPage";
import HelpPage from "./HelpPage";
import PricingPage from "./PricingPage";
import EstimatePage from "./EstimatePage";
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
   AI MAIN PAGE (GROK-STYLE)
   ═══════════════════════════════════════════ */

interface AgentResponse {
  text: string;
  visible: boolean;
}

const AIChatContent = ({ onNavigate, userRole, chatHook }: { onNavigate: (id: string) => void; userRole?: string | null; chatHook?: ReturnType<typeof useChats> }) => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    const query = input;
    setInput("");
    setIsThinking(true);

    // Persist to DB if logged in
    if (user && chatHook) {
      if (!chatHook.currentChatId) {
        await chatHook.createChat(query.slice(0, 60));
      }
      await chatHook.sendMessage(query, "user");
    }

    // Simulate agent response with fade-in
    setTimeout(() => {
      const agentText = `Анализирую ваш запрос: «${query}»\n\nДля полной работы с вашим проектом мне потребуется:\n\n• Геоинтеллект — анализ участка\n• BIM Studio — проектирование\n• Смета — расчёт бюджета\n\nЭти инструменты готовы к работе в экосистеме. Выберите сервис в боковом меню или уточните задачу.`;

      if (user && chatHook) {
        chatHook.sendMessage(agentText, "assistant");
      }

      setResponses((prev) => [...prev, { text: agentText, visible: false }]);
      // Trigger fade-in
      requestAnimationFrame(() => {
        setResponses((prev) => prev.map((r, i) => i === prev.length - 1 ? { ...r, visible: true } : r));
      });
      setIsThinking(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full items-center justify-center relative">
      {/* Premium logo */}
      <div className="mb-12 text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-black tracking-[0.15em]">
          <span className="bg-gradient-to-r from-emerald-400 via-primary to-amber-400 bg-clip-text text-transparent">
            BUILDVERSE
          </span>
        </h1>
      </div>

      {/* Agent responses - fade in on background */}
      {responses.length > 0 && (
        <div className="w-full max-w-2xl mb-8 space-y-4 px-4">
          {responses.map((r, i) => (
            <div
              key={i}
              className={`glass-card rounded-2xl p-6 transition-all duration-700 ease-out ${
                r.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Greeting */}
      {responses.length === 0 && (
        <p className="text-muted-foreground text-sm md:text-base mb-8 text-center animate-fade-in max-w-lg px-4">
          Расскажите о вашем проекте — от идеи до реальности.
        </p>
      )}

      {/* Central input */}
      <div className="w-full max-w-2xl px-4 animate-fade-in">
        <div className="glass-card glass-glow rounded-2xl p-4 flex items-center gap-3 border border-white/15">
          <button className="text-muted-foreground hover:text-primary transition-colors p-1 shrink-0" title="Добавить файл">
            <Paperclip className="w-5 h-5" />
          </button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Опишите ваш строительный проект…"
            className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 text-base"
          />
          {isThinking ? (
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
          ) : (
            <button onClick={handleSend} className="text-primary hover:text-primary/80 transition-colors p-1 shrink-0" title="Отправить">
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   GEO CONTENT (INTERACTIVE MAP)
   ═══════════════════════════════════════════ */
const GeoContent = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  const [activeTab, setActiveTab] = useState("climate");
  const [searchQuery, setSearchQuery] = useState("");
  const [pinPlaced, setPinPlaced] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setPinPlaced(true);
      setAnalysisStarted(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-foreground tracking-wide">Геоинтеллект</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Превращает любой участок в точную цифровую основу BIM-проекта за секунды
        </p>
      </div>

      {/* Search bar */}
      <div className="glass-card rounded-2xl p-3 flex items-center gap-2">
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Введите адрес или кадастровый номер участка"
          className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 text-sm"
        />
        <Button
          size="sm"
          onClick={handleSearch}
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs shrink-0"
        >
          Найти
        </Button>
      </div>

      {/* Interactive map */}
      <div className="glass-card rounded-2xl overflow-hidden relative" style={{ height: "400px" }}>
        {pinPlaced ? (
          <iframe
            src="https://yandex.ru/map-widget/v1/?ll=37.617700%2C55.755864&z=12&l=map"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            className="absolute inset-0"
            title="Яндекс Карта"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "radial-gradient(circle at 30% 40%, hsl(var(--primary)) 1px, transparent 1px), radial-gradient(circle at 70% 60%, hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }} />
            <MapPin className="w-12 h-12 text-muted-foreground/30 mb-3 relative z-10" />
            <p className="text-sm text-muted-foreground/50 relative z-10">Выберите участок для запуска анализа</p>
          </div>
        )}
        {/* Pin overlay */}
        {pinPlaced && (
          <div className="absolute top-3 left-3 z-10 glass-card rounded-xl px-3 py-2 text-xs text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{searchQuery}</span>
          </div>
        )}
      </div>

      {/* Launch analysis button */}
      {pinPlaced && !analysisStarted && (
        <Button
          className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 h-12 text-sm font-semibold"
          onClick={() => setAnalysisStarted(true)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Запустить анализ выбранного участка
        </Button>
      )}

      {/* 5 Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {geoTabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all
              ${activeTab === t.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "glass-card text-muted-foreground hover:text-foreground hover:bg-white/10"
              }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content panel */}
      <div className="glass-card rounded-2xl p-6 min-h-[120px] flex items-center justify-center animate-fade-in">
        {analysisStarted ? (
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Анализ будет выполнен после подключения AI-агента.</p>
            <p className="text-xs text-muted-foreground/50">Данные автоматически передадутся в BIM Studio</p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Анализ будет выполнен после подключения AI-агента.
            </p>
            <p className="text-xs text-muted-foreground/50">
              Данные автоматически передадутся в BIM Studio
            </p>
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          className="w-full glass-card hover:glass-glow text-foreground border border-white/15 h-12 text-sm"
          variant="ghost"
        >
          <Download className="w-4 h-4 mr-2 text-primary" />
          Экспортировать все данные в мой проект
        </Button>
        <Button
          className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 h-12 text-sm"
          onClick={() => onNavigate("chat")}
        >
          <Bot className="w-4 h-4 mr-2" />
          Передать данные центральному AI-агенту для создания полного BIM
        </Button>
      </div>
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
  { id: 1, name: "СтройГрад", specialization: "Фундаментные работы", rating: 4.8, reviews: 47, region: "Москва", experience: "12 лет", verified: true, price: "от 120 000 ₽" },
  { id: 2, name: "ЭкоСтрой", specialization: "Отделка", rating: 4.5, reviews: 23, region: "МО", experience: "8 лет", verified: true, price: "от 80 000 ₽" },
  { id: 3, name: "Инженерные решения", specialization: "Инженерия", rating: 4.9, reviews: 62, region: "СПб", experience: "15 лет", verified: true, price: "от 200 000 ₽" },
  { id: 4, name: "КаркасПро", specialization: "Каркасные дома", rating: 4.6, reviews: 31, region: "Москва", experience: "10 лет", verified: false, price: "от 150 000 ₽" },
];

const contractorWorkTypes = ["Все", "Фундаментные работы", "Отделка", "Инженерия", "Каркасные дома"];
const contractorRegions = ["Все", "Москва", "МО", "СПб"];

const ContractorsContent = () => {
  const [workType, setWorkType] = useState("Все");
  const [regionF, setRegionF] = useState("Все");
  const [inviteTo, setInviteTo] = useState<typeof contractorsMock[0] | null>(null);
  const [inviteDone, setInviteDone] = useState(false);

  const filtered = contractorsMock.filter((c) => {
    if (workType !== "Все" && c.specialization !== workType) return false;
    if (regionF !== "Все" && c.region !== regionF) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        AI‑агент BUILDVERSE подбирает подрядчиков под ваш проект, регион и бюджет.
      </p>

      <div className="glass-card rounded-xl p-3 flex items-center gap-2 flex-wrap">
        <select value={workType} onChange={(e) => setWorkType(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground">
          {contractorWorkTypes.map((w) => <option key={w} value={w}>{w === "Все" ? "Тип работ" : w}</option>)}
        </select>
        <select value={regionF} onChange={(e) => setRegionF(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground">
          {contractorRegions.map((r) => <option key={r} value={r}>{r === "Все" ? "Регион" : r}</option>)}
        </select>
      </div>

      {filtered.map((c) => (
        <div key={c.id} className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                {c.name}
                {c.verified && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">✓ Верифицирован</span>}
              </h4>
              <p className="text-[11px] text-muted-foreground">{c.specialization} • {c.region} • {c.experience}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-foreground font-bold">{c.rating}</span>
                <span className="text-muted-foreground">({c.reviews})</span>
              </div>
              <p className="text-xs text-primary font-medium mt-0.5">{c.price}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs"
              onClick={() => { setInviteTo(c); setInviteDone(false); }}>
              <Wrench className="w-3.5 h-3.5 mr-1" /> Пригласить
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 glass-card text-foreground text-xs">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Написать
            </Button>
          </div>
        </div>
      ))}

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
  const staticPages = ["about"];

  const renderContent = () => {
    if (staticPages.includes(activeSection)) {
      return <StaticPage slug={activeSection} />;
    }
    if (activeSection === "tariffs") return <PricingPage />;
    if (activeSection === "estimate") return <EstimatePage onNavigate={onNavigate} />;
    if (activeSection === "partners") return <PartnersPage />;
    if (activeSection === "privacy") return <PrivacyPage />;
    if (activeSection === "help") return <HelpPage />;
    if (activeSection === "profile") return <ProfilePage />;
    if (activeSection === "settings") return <SettingsPage />;

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
