import { useState } from "react";
import { MapPin, Cloud, Mountain, TreePine, Sun, Layers, Plus, Paperclip, Mic, Send, MessageSquare, Clock, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const geoTabs = [
  { id: "climate", label: "Климат", icon: Cloud },
  { id: "soil", label: "Грунт", icon: Layers },
  { id: "relief", label: "Рельеф", icon: Mountain },
  { id: "eco", label: "Экосистема", icon: TreePine },
  { id: "sun", label: "Солнце", icon: Sun },
];

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

const GeoContent = () => {
  const [activeTab, setActiveTab] = useState("climate");
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-card rounded-2xl h-64 md:h-80 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5" />
        <div className="text-center relative z-10">
          <MapPin className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
          <p className="text-muted-foreground text-sm">Интерактивная карта участка</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Выберите локацию для анализа</p>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {geoTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all
              ${activeTab === tab.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "glass-card text-muted-foreground hover:text-foreground"}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
      <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
        <Plus className="w-4 h-4 mr-2" />
        Создать проект
      </Button>
    </div>
  );
};

const PlaceholderContent = ({ section }: { section: string }) => {
  const items: Record<string, string[]> = {
    projects: ["Активные проекты: 3", "Черновики: 2", "Прогресс: 67%"],
    stroynet: ["#Фундамент — 12 сообщений", "#Эко — 8 сообщений", "#УмныйДом — 5 сообщений"],
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

const CenterZone = ({ activeSection, onRequestAuth }: CenterZoneProps) => {
  const [chatSent, setChatSent] = useState(false);

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground px-1">
        {sectionTitles[activeSection] || "Геоинтеллект"}
      </h2>

      <div className="flex-1 overflow-y-auto">
        {activeSection === "geo" ? <GeoContent /> : <PlaceholderContent section={activeSection} />}
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
        <button
          onClick={() => setChatSent(true)}
          className="text-primary hover:text-primary/80 transition-colors p-1"
        >
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
