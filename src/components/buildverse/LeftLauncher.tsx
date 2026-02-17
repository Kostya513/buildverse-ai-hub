import {
  Globe, FolderOpen, MessageSquare, Building2, ShoppingCart,
  HardHat, Calculator, Home, Bell,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const tiles = [
  { icon: Globe, label: "Геоинтеллект", id: "geo", hint: "Геоинтеллект — анализ участка" },
  { icon: FolderOpen, label: "Мои проекты", id: "projects", hint: "Управление проектами" },
  { icon: MessageSquare, label: "Стройнет", id: "stroynet", hint: "Стройнет — сообщество" },
  { icon: Building2, label: "Инвестиции", id: "invest", hint: "Инвестиции — публичные проекты" },
  { icon: ShoppingCart, label: "Маркетплейс", id: "market", hint: "Маркетплейс — материалы и услуги" },
  { icon: HardHat, label: "Подрядчики", id: "contractors", hint: "Подрядчики — поиск и найм" },
  { icon: Calculator, label: "Смета", id: "estimate", hint: "Смета — расчёт бюджета" },
  { icon: Home, label: "Цифровой паспорт", id: "passport", hint: "Цифровой паспорт здания" },
  { icon: Bell, label: "Уведомления", id: "notifications", hint: "Уведомления и оповещения" },
];

interface LeftLauncherProps {
  activeId: string;
  onSelect: (id: string) => void;
}

const LeftLauncher = ({ activeId, onSelect }: LeftLauncherProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <aside className="hidden lg:flex flex-col items-center gap-2 w-16 shrink-0 py-4 overflow-y-auto scrollbar-none">
        {tiles.map((tile) => {
          const isActive = activeId === tile.id;
          return (
            <Tooltip key={tile.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(tile.id)}
                  className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive
                      ? "glass-glow bg-primary/20 border border-primary/40"
                      : "glass-card hover:bg-white/10 hover:scale-110"
                    }`}
                >
                  <tile.icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass-card border-white/15 text-foreground text-xs">
                {tile.hint}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </aside>
    </TooltipProvider>
  );
};

export { tiles };
export default LeftLauncher;
