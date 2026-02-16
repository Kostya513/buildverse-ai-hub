import { useState } from "react";
import {
  MapPin, Cloud, Mountain, TreePine, Sun, Layers, Plus, Paperclip, Mic, Send,
  MessageSquare, Clock, Wand2, Search, Filter, FolderOpen, Heart, ThumbsUp,
  User, Building2, PenTool, ChevronRight, Sparkles, Eye,
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
}

const sectionTitles: Record<string, string> = {
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
   GEO CONTENT
   ═══════════════════════════════════════════ */
const GeoContent = () => {
  const [activeTab, setActiveTab] = useState("climate");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const tab = geoTabContent[activeTab];

  return (
    <div className="space-y-4 animate-fade-in">
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

      {/* Create project */}
      <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => setShowChat(!showChat)}>
        <Plus className="w-4 h-4 mr-2" />
        Создать проект
      </Button>

      {showChat && (
        <div className="glass-card rounded-xl p-4 space-y-3 animate-fade-in border border-primary/20">
          <p className="text-xs text-muted-foreground">Чат с ИИ:</p>
          <div className="bg-primary/10 rounded-lg px-3 py-2 text-xs text-foreground">
            Участок в Истринском р-не МО. Климат: снеговая 180 кг/м², ветер III зона. Грунт: суглинок, УГВ 2.1 м. Помоги предложить тип фундамента и общую концепцию дома.
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-muted-foreground">
            Рекомендую: 2-этажный каркасный дом на утеплённой шведской плите (УШП). Ориентация главного фасада — юго-восток. Угол ската кровли — 38° для оптимального снегосброса. Площадь дома: 150–180 м².
          </div>
        </div>
      )}
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

const ProjectsContent = () => {
  const [filter, setFilter] = useState("all");
  const [showNewChat, setShowNewChat] = useState(false);
  const filters = ["all", "active", "draft", "done"];
  const filterLabels: Record<string, string> = { all: "Все", active: "Активные", draft: "Черновики", done: "Завершённые" };
  const statusMap: Record<string, string> = { active: "В работе", draft: "Черновик", done: "Завершён" };

  const filtered = filter === "all" ? projectsMock : projectsMock.filter((p) => p.status === statusMap[filter]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === f ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >{filterLabels[f]}</button>
        ))}
      </div>

      {/* Project cards */}
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
            <Button variant="ghost" size="sm" className="glass-card text-foreground text-xs flex-1">
              <MessageSquare className="w-3.5 h-3.5 mr-1" /> Чат с ИИ
            </Button>
          </div>
        </div>
      ))}

      {/* New project */}
      <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
        onClick={() => setShowNewChat(!showNewChat)}>
        <Plus className="w-4 h-4 mr-2" /> Новый проект
      </Button>

      {showNewChat && (
        <div className="glass-card rounded-xl p-4 space-y-2 animate-fade-in border border-primary/20">
          <p className="text-xs text-muted-foreground">Чат с ИИ:</p>
          <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-muted-foreground">
            Создаём новый проект. Опишите участок и требования (площадь, этажность, стиль).
          </div>
        </div>
      )}
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
    text: "Участок 12 соток, суглинок, УГВ 1.8 м. Планирую одноэтажный дом 120 м². Свайный или плита? Кто делал на похожем грунте?",
    tags: ["#Фундамент"], likes: 12, replies: 8,
  },
  {
    id: 2, author: "ООО «СтройГрад»", role: "Подрядчик", icon: Building2,
    title: "Ищем заказы на фундаментные работы — Московская область",
    text: "Бригада 8 человек, опыт 12 лет. Делаем УШП, свайно-ростверковые, монолитные плиты. Есть свободные слоты на август.",
    tags: ["#Фундамент", "#Инвестиции"], likes: 5, replies: 3,
  },
  {
    id: 3, author: "Анна Сидорова", role: "Архитектор", icon: PenTool,
    title: "3D-концепт эко-дома с зелёной кровлей",
    text: "Разработала проект пассивного дома 180 м² с зелёной кровлей и солнечными панелями. Энергопотребление — 15 кВт·ч/м²/год. Делюсь концептом.",
    tags: ["#Эко", "#УмныйДом"], likes: 24, replies: 15,
  },
  {
    id: 4, author: "Дмитрий Козлов", role: "Самозанятый", icon: User,
    title: "Опыт установки умного дома на базе Zigbee",
    text: "Поставил 40 датчиков, автоматизировал отопление и освещение. Экономия 30% на электричестве. Расскажу про подводные камни.",
    tags: ["#УмныйДом"], likes: 18, replies: 11,
  },
];

const channels = ["Все", "#Фундамент", "#УмныйДом", "#Эко", "#Инвестиции"];

const StroynetContent = ({ onRequestAuth }: { onRequestAuth: () => void }) => {
  const [channel, setChannel] = useState("Все");
  const [showPostModal, setShowPostModal] = useState(false);

  const filtered = channel === "Все" ? postsMock : postsMock.filter((p) => p.tags.includes(channel));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Channel filters */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {channels.map((c) => (
          <button key={c} onClick={() => setChannel(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              channel === c ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >{c}</button>
        ))}
      </div>

      {/* Create post */}
      <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={onRequestAuth}>
        <Plus className="w-4 h-4 mr-2" /> Создать пост
        <span className="ml-auto text-[10px] text-muted-foreground">Только для зарегистрированных</span>
      </Button>

      {/* Posts */}
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
const CenterZone = ({ activeSection, onRequestAuth }: CenterZoneProps) => {
  const [chatSent, setChatSent] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "geo": return <GeoContent />;
      case "projects": return <ProjectsContent />;
      case "stroynet": return <StroynetContent onRequestAuth={onRequestAuth} />;
      default: return <PlaceholderContent section={activeSection} />;
    }
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground px-1">
        {sectionTitles[activeSection] || "Геоинтеллект"}
      </h2>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {renderContent()}
      </div>

      {/* Chat bar */}
      <div className="glass-card rounded-2xl p-3 flex items-center gap-2 mt-auto">
        <button className="text-muted-foreground hover:text-primary transition-colors p-1">
          <Paperclip className="w-4 h-4" />
        </button>
        <button className="text-muted-foreground hover:text-primary transition-colors p-1">
          <Mic className="w-4 h-4" />
        </button>
        <Input
          placeholder="Опишите ваш проект..."
          className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-sm"
        />
        <button onClick={() => setChatSent(true)} className="text-primary hover:text-primary/80 transition-colors p-1">
          <Send className="w-4 h-4" />
        </button>
      </div>

      {chatSent && (
        <div className="flex gap-2 animate-fade-in">
          <Button variant="ghost" size="sm" className="glass-card text-foreground text-xs">
            <MessageSquare className="w-3.5 h-3.5 mr-1" /> Новый чат
          </Button>
          <Button variant="ghost" size="sm" className="glass-card text-foreground text-xs">
            <Clock className="w-3.5 h-3.5 mr-1" /> История
          </Button>
          <Button variant="ghost" size="sm" className="glass-card text-foreground text-xs" onClick={onRequestAuth}>
            <Wand2 className="w-3.5 h-3.5 mr-1" /> 3D Генератор
          </Button>
        </div>
      )}
    </div>
  );
};

export default CenterZone;
