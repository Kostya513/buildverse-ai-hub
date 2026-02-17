import { Search, Plus, Clock, Mic, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";

const chatHistory = [
  { id: 1, title: "Проект дома в Истре", time: "Сегодня" },
  { id: 2, title: "Анализ участка 15 соток", time: "Вчера" },
  { id: 3, title: "Смета на фундамент УШП", time: "3 дня назад" },
  { id: 4, title: "Подбор подрядчика МО", time: "Неделю назад" },
];

const RightSidebar = () => {
  return (
    <aside className="hidden xl:flex flex-col gap-3 w-60 shrink-0 p-2 overflow-y-auto scrollbar-none">
      {/* Header */}
      <div className="px-2 pt-1">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Меню агента
        </h3>
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Поиск по диалогам…"
            className="bg-white/5 border-white/10 text-xs h-8 pl-8 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          />
        </div>
      </div>

      {/* New chat */}
      <button className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-sm text-foreground hover:bg-white/10 transition-colors">
        <Plus className="w-4 h-4 text-primary" />
        <span className="font-medium">Новый чат</span>
      </button>

      {/* Chat history */}
      <div className="glass-card rounded-xl p-3 space-y-1 flex-1">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-1 mb-2">
          История чатов
        </p>
        {chatHistory.map((chat) => (
          <button
            key={chat.id}
            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors group"
          >
            <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
              {chat.title}
            </p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="w-2.5 h-2.5" />
              {chat.time}
            </p>
          </button>
        ))}
      </div>

      {/* Voice mode */}
      <button className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-sm text-foreground hover:bg-white/10 transition-colors">
        <Mic className="w-4 h-4 text-primary" />
        <span className="font-medium">Голосовой режим</span>
      </button>
    </aside>
  );
};

export default RightSidebar;
