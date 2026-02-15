import { tiles } from "./LeftLauncher";

interface MobileBarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

const MobileBar = ({ activeId, onSelect }: MobileBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card lg:hidden overflow-x-auto">
      <div className="flex gap-1 p-2 min-w-max">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => onSelect(tile.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all
              ${activeId === tile.id ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
          >
            <tile.icon className="w-4 h-4" />
            <span className="text-[10px]">{tile.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileBar;
