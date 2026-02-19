import { useState, useEffect } from "react";
import { Search, Plus, Clock, Mic, MessageSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useChats, ChatItem } from "@/hooks/useChats";

interface RightSidebarProps {
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string | null;
}

const RightSidebar = ({ onNewChat, onSelectChat, currentChatId }: RightSidebarProps) => {
  const { user } = useAuth();
  const { chats, loadChats, searchChats } = useChats();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatItem[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [showVoice, setShowVoice] = useState(false);

  useEffect(() => {
    if (user) loadChats();
  }, [user, loadChats]);

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

  return (
    <aside className="hidden xl:flex flex-col gap-3 w-60 shrink-0 p-2 overflow-y-auto scrollbar-none">
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={user ? "Поиск по диалогам…" : "Войдите для поиска"}
            disabled={!user}
            className="bg-white/5 border-white/10 text-xs h-8 pl-8 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          />
        </div>
        {searchResults && (
          <button onClick={() => { setSearchResults(null); setSearchQuery(""); }}
            className="text-[10px] text-primary hover:underline">Очистить поиск</button>
        )}
      </div>

      {/* New chat */}
      <button
        onClick={onNewChat}
        disabled={!user}
        className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-sm text-foreground hover:bg-white/10 transition-colors disabled:opacity-50"
      >
        <Plus className="w-4 h-4 text-primary" />
        <span className="font-medium">Новый чат</span>
      </button>

      {/* Chat history */}
      <div className="glass-card rounded-xl p-3 space-y-1 flex-1">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-1 mb-2">
          История чатов
        </p>
        {!user ? (
          <p className="text-xs text-muted-foreground/60 px-1">Войдите, чтобы сохранять чаты</p>
        ) : searching ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
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

      {/* Voice mode */}
      <button
        onClick={() => setShowVoice(!showVoice)}
        className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-sm text-foreground hover:bg-white/10 transition-colors"
      >
        <Mic className="w-4 h-4 text-primary" />
        <span className="font-medium">Голосовой режим</span>
      </button>
      {showVoice && (
        <div className="glass-card rounded-xl p-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground">Голосовой режим</p>
          <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-xs border border-primary/30 hover:bg-primary/30 transition-colors">
            🎙 Начать запись
          </button>
          <p className="text-[10px] text-muted-foreground/60">Web Speech API • Демо</p>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
