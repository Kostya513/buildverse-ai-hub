import { useState, useEffect } from "react";
import { Search, Plus, Clock, FolderOpen, Mic, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useChats, ChatItem } from "@/hooks/useChats";

interface RightSidebarProps {
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
}

const iconItems = [
  { id: "search", icon: Search, label: "Поиск", desc: "Поиск по диалогам и проектам" },
  { id: "new", icon: Plus, label: "Новый чат", desc: "Очистка сессии, старт нового диалога" },
  { id: "projects", icon: FolderOpen, label: "Проекты", desc: "Доступ к списку проектов" },
  { id: "history", icon: Clock, label: "История", desc: "История чатов с агентом" },
  { id: "voice", icon: Mic, label: "Голосовой", desc: "Голосовой режим ввода" },
];

const RightSidebar = ({ onNewChat, onSelectChat, currentChatId, expanded, onToggleExpand }: RightSidebarProps) => {
  const { user } = useAuth();
  const { chats, loadChats, searchChats } = useChats();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatItem[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (user) loadChats();
  }, [user, loadChats]);

  const handleIconClick = (id: string) => {
    if (id === "new") {
      onNewChat?.();
      return;
    }
    if (activePanel === id) {
      setActivePanel(null);
    } else {
      setActivePanel(id);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setSearching(true);
    const results = await searchChats(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const displayChats = searchResults ?? chats;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return "Сегодня";
    if (diff < 172800000) return "Вчера";
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} дн. назад`;
    return d.toLocaleDateString("ru");
  };

  // Compact icon-only mode
  if (!expanded) {
    return (
      <aside className="hidden lg:flex flex-col items-center gap-2 w-12 shrink-0 py-4">
        {iconItems.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => handleIconClick(item.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                ${activePanel === item.id
                  ? "glass-glow bg-primary/20 border border-primary/40"
                  : "glass-card hover:bg-white/10 hover:scale-110"
                }`}
            >
              <item.icon className={`w-4.5 h-4.5 ${activePanel === item.id ? "text-primary" : "text-muted-foreground"}`} />
            </button>
            {/* Tooltip */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="glass-card rounded-lg px-3 py-1.5 text-[11px] text-foreground whitespace-nowrap">
                {item.label}
              </div>
            </div>
          </div>
        ))}

        {/* Separator */}
        <div className="w-6 h-px bg-white/15 my-1" />

        {/* Quick command icons */}
        {["🏠", "📐", "💰", "📊"].map((emoji, i) => (
          <button
            key={i}
            className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-xs hover:bg-white/10 transition-all hover:scale-110"
            title="Быстрая команда"
          >
            {emoji}
          </button>
        ))}

        {/* Expand button */}
        <button
          onClick={onToggleExpand}
          className="mt-auto w-10 h-10 rounded-xl glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
          title="Развернуть панель"
        >
          <span className="text-xs">◀</span>
        </button>
      </aside>
    );
  }

  // Expanded mode
  return (
    <aside className="hidden lg:flex flex-col gap-2 w-64 shrink-0 py-2 overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-3">
        <h3 className="text-sm font-bold text-foreground">Меню агента</h3>
        <button
          onClick={onToggleExpand}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
        >
          <span className="text-xs">▶</span>
        </button>
      </div>

      {/* Icon row */}
      <div className="flex gap-1 px-2">
        {iconItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleIconClick(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all text-center
              ${activePanel === item.id
                ? "bg-primary/20 text-primary"
                : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
              }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-[9px] leading-none">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="h-px bg-white/10 mx-3" />

      {/* Panels */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 space-y-2">
        {/* Search panel */}
        {activePanel === "search" && (
          <div className="glass-card rounded-xl p-3 space-y-2 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Поиск по диалогам…"
                disabled={!user}
                className="bg-white/5 border-white/10 text-xs h-8 pl-8 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
              />
            </div>
            {searchResults && (
              <button onClick={() => { setSearchResults(null); setSearchQuery(""); }}
                className="text-[10px] text-primary hover:underline">Очистить</button>
            )}
            {searching && <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>}
            {searchResults && !searching && searchResults.length === 0 && (
              <p className="text-[10px] text-muted-foreground/60 text-center py-2">Ничего не найдено</p>
            )}
            {searchResults && searchResults.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat?.(chat.id)}
                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <p className="text-xs text-foreground truncate">{chat.title}</p>
                <p className="text-[10px] text-muted-foreground">{formatTime(chat.updated_at)}</p>
              </button>
            ))}
          </div>
        )}

        {/* History panel */}
        {(activePanel === "history" || !activePanel) && (
          <div className="glass-card rounded-xl p-3 space-y-1 animate-fade-in">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-1 mb-2">
              История чатов
            </p>
            {!user ? (
              <p className="text-xs text-muted-foreground/60 px-1">Войдите для сохранения чатов</p>
            ) : displayChats.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 px-1">Нет чатов</p>
            ) : (
              displayChats.slice(0, 20).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat?.(chat.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors group ${
                    currentChatId === chat.id ? "bg-white/10" : ""
                  }`}
                >
                  <p className="text-xs text-foreground truncate group-hover:text-primary transition-colors">
                    {chat.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTime(chat.updated_at)}
                  </p>
                </button>
              ))
            )}
          </div>
        )}

        {/* Projects panel */}
        {activePanel === "projects" && (
          <div className="glass-card rounded-xl p-3 space-y-2 animate-fade-in">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-1 mb-2">
              Проекты
            </p>
            {["Дом в Истре", "Таунхаус «Сосны»", "ЖК «Изумрудный»", "Дача в Переделкино"].map((name) => (
              <button
                key={name}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <p className="text-xs text-foreground flex items-center gap-1.5">
                  <FolderOpen className="w-3 h-3 text-primary" />
                  {name}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Voice panel */}
        {activePanel === "voice" && (
          <div className="glass-card rounded-xl p-4 text-center space-y-3 animate-fade-in">
            <Mic className="w-8 h-8 text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Голосовой режим</p>
            <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-xs border border-primary/30 hover:bg-primary/30 transition-colors">
              🎙 Начать запись
            </button>
            <p className="text-[10px] text-muted-foreground/60">Нажмите для голосового ввода</p>
          </div>
        )}
      </div>

      {/* Quick commands */}
      <div className="px-3">
        <div className="h-px bg-white/10 mb-2" />
        <div className="flex gap-1.5 justify-center">
          {["🏠", "📐", "💰", "📊"].map((emoji, i) => (
            <button
              key={i}
              className="w-8 h-8 rounded-lg glass-card flex items-center justify-center text-xs hover:bg-white/10 transition-all hover:scale-110"
              title="Быстрая команда"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
