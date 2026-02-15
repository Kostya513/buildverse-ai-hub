import {
  Globe, FolderOpen, MessageSquare, Building2, ShoppingCart,
  HardHat, Calculator, Brain, Home, Bell,
} from "lucide-react";

const tiles = [
  { icon: Globe, label: "Геоинтеллект", id: "geo" },
  { icon: FolderOpen, label: "Мои проекты", id: "projects" },
  { icon: MessageSquare, label: "Стройнет", id: "stroynet" },
  { icon: Building2, label: "Инвестиции", id: "invest" },
  { icon: ShoppingCart, label: "Маркетплейс", id: "market" },
  { icon: HardHat, label: "Подрядчики", id: "contractors" },
  { icon: Calculator, label: "Смета", id: "estimate" },
  { icon: Brain, label: "СтройМакс", id: "stroymax" },
  { icon: Home, label: "Цифровой паспорт", id: "passport" },
  { icon: Bell, label: "Уведомления", id: "notifications" },
];

interface LeftLauncherProps {
  activeId: string;
  onSelect: (id: string) => void;
}

const LeftLauncher = ({ activeId, onSelect }: LeftLauncherProps) => {
  return (
    <aside className="hidden lg:flex flex-col gap-2 w-60 xl:w-64 shrink-0 p-2 overflow-y-auto max-h-[calc(100vh-7rem)]">
      {tiles.map((tile) => (
        <button
          key={tile.id}
          onClick={() => onSelect(tile.id)}
          className={`glass-card-hover flex items-center gap-3 px-4 py-3 rounded-xl text-left
            ${activeId === tile.id ? "border-primary/40 glass-glow" : ""}`}
        >
          <tile.icon className={`w-5 h-5 shrink-0 ${activeId === tile.id ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-sm font-medium text-foreground truncate">{tile.label}</span>
        </button>
      ))}
    </aside>
  );
};

export { tiles };
export default LeftLauncher;
