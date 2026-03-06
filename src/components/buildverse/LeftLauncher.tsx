import { useState } from "react";
import {
  Bot, Globe, FolderOpen, MessageSquare, Building2, ShoppingCart,
  HardHat, Calculator, Home, Bell,
} from "lucide-react";

const tiles = [
  { icon: Bot, label: "Чат", id: "chat", desc: "AI-агент BUILDVERSE" },
  { icon: Globe, label: "Геоинтеллект", id: "geo", desc: "Анализ участка — климат, грунт, рельеф" },
  { icon: FolderOpen, label: "Мои проекты", id: "projects", desc: "Управление вашими проектами" },
  { icon: MessageSquare, label: "Стройнет", id: "stroynet", desc: "Профессиональное сообщество" },
  { icon: Calculator, label: "Смета", id: "estimate", desc: "Расчёт бюджета проекта" },
  { icon: Home, label: "Цифровой паспорт", id: "passport", desc: "Паспорт здания с IoT" },
  { icon: Bell, label: "Уведомления", id: "notifications", desc: "Оповещения и события" },
  { icon: Building2, label: "Инвестиции", id: "invest", desc: "Публичные инвестпроекты" },
  { icon: ShoppingCart, label: "Маркетплейс", id: "market", desc: "Материалы и услуги" },
  { icon: HardHat, label: "Подрядчики", id: "contractors", desc: "Поиск и найм подрядчиков" },
];

interface LeftLauncherProps {
  activeId: string;
  onSelect: (id: string) => void;
}

const LeftLauncher = ({ activeId, onSelect }: LeftLauncherProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside className="hidden lg:flex flex-col items-center gap-2 w-16 shrink-0 py-4 overflow-y-auto scrollbar-none relative">
      {tiles.map((tile) => {
        const isActive = activeId === tile.id;
        const isHovered = hoveredId === tile.id;

        return (
          <div
            key={tile.id}
            className="relative"
            onMouseEnter={() => setHoveredId(tile.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => onSelect(tile.id)}
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
                ${isActive
                  ? "glass-glow bg-primary/20 border border-primary/40"
                  : "glass-card hover:bg-white/10 hover:scale-110"
                }`}
            >
              <tile.icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            </button>

            {/* Floating hover card */}
            {isHovered && (
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none animate-scale-in"
                style={{ transformOrigin: "left center" }}
              >
                <div className="glass-card glass-glow rounded-2xl px-5 py-4 min-w-[220px] border border-white/15">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <tile.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground">{tile.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tile.desc}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};

export { tiles };
export default LeftLauncher;
