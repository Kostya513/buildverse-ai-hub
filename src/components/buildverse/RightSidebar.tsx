import { useState, useEffect } from "react";
import { Search, Plus, Clock, FolderOpen, Mic, Loader2, Settings as SettingsIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useChats, ChatItem } from "@/hooks/useChats";
import { toast } from "sonner";

interface RightSidebarProps {
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
  chatHook?: ReturnType<typeof useChats>;
  onOpenSettings?: () => void;
}

const iconItems = [
  { id: "search", icon: Search, label: "Поиск" },
  { id: "new", icon: Plus, label: "Новый чат" },
  { id: "history", icon: Clock, label: "История" },
  { id: "projects", icon: FolderOpen, label: "Проекты" },
  { id: "voice", icon: Mic, label: "Голос" },
  { id: "settings", icon: SettingsIcon, label: "Настройки" },
];

const RightSidebar = ({
  onNewChat,
  onSelectChat,
  currentChatId,
  expanded,
  onToggleExpand,
  chatHook,
  onOpenSettings,
}: RightSidebarProps) => {
  const { user } = useAuth();
  const localHook = useChats();
  const hook = chatHook ?? localHook;
  const { chats, loadChats, searchChats } = hook;

  const [activePanel, setActivePanel] = useState<string | null>("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatItem[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  useEffect(() => {
    if (user && !chatHook) loadChats();
  }, [user, loadChats, chatHook]);

  const startVoice = () => {
    const SR =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Голосовой ввод не поддерживается браузером");
      return;
    }
    try {
      const rec = new (SR as new () => {
        lang: string;
        start: () => void;
        stop: () => void;
        onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void;
        onend: () => void;
        onerror: (e: { error: string }) => void;
      })();
      rec.lang = "ru-RU";
      setVoiceActive(true);
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        toast.success(`Распознано: ${text}`);
      };
      rec.onend = () => setVoiceActive(false);
      rec.onerror = (e) => {
        toast.error(`Ошибка распознавания: ${e.error}`);
        setVoiceActive(false);
      };
      rec.start();
    } catch {
      toast.error("Не удалось запустить распознавание");
      setVoiceActive(false);
    }
  };

  const handleIconClick = (id: string) => {
    if (id === "new") {
      onNewChat?.();
      return;
    }
    if (id === "settings") {
      onOpenSettings?.();
      return;
    }
    if (id === "voice") {
      setActivePanel("voice");
      startVoice();
      return;
    }
    setActivePanel((prev) => (prev === id ? null : id));
  };

  const handleSelectChat = (chatId: string) => {
    onSelectChat?.(chatId);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const results = await searchChats(searchQuery);
      setSearchResults(results);
    } catch {
      toast.error("Ошибка поиска");
    } finally {
      setSearching(false);
    }
  };

  const displayChats = searchResults ?? chats;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
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
              type="button"
              onClick={() => handleIconClick(item.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer
                ${
                  activePanel === item.id
                    ? "glass-glow bg-primary/20 border border-primary/40"
                    : "glass-card hover:bg-white/10 hover:scale-110"
                }`}
            >
              <item.icon
                className={`w-4 h-4 ${
                  activePanel === item.id ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </button>
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="glass-card rounded-lg px-3 py-1.5 text-[11px] text-foreground whitespace-nowrap">
                {item.label}
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onToggleExpand}
          className="mt-auto w-10 h-10 rounded-xl glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all cursor-pointer"
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
      <div className="flex items-center justify-between px-3">
        <h3 className="text-sm font-bold text-foreground">Меню агента</h3>
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="text-xs">▶</span>
        </button>
      </div>

      <div className="flex gap-1 px-2">
        {iconItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleIconClick(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all text-center cursor-pointer
              ${
                activePanel === item.id
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
              }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-[9px] leading-none">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="h-px bg-white/10 mx-3" />

      <div className="flex-1 overflow-y-auto scrollbar-none px-2 space-y-2">
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
              <button
                type="button"
                onClick={() => {
                  setSearchResults(null);
                  setSearchQuery("");
                }}
                className="text-[10px] text-primary hover:underline cursor-pointer"
              >
                Очистить
              </button>
            )}
            {searching && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}
            {searchResults && !searching && searchResults.length === 0 && (
              <p className="text-[10px] text-muted-foreground/60 text-center py-2">Ничего не найдено</p>
            )}
            {searchResults?.map((chat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => handleSelectChat(chat.id)}
                className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                  currentChatId === chat.id ? "ring-2 ring-emerald-500 bg-primary/10" : ""
                }`}
              >
                <p className="text-xs text-foreground truncate">{chat.title}</p>
                <p className="text-[10px] text-muted-foreground">{formatTime(chat.updated_at)}</p>
              </button>
            ))}
          </div>
        )}

        {(activePanel === "history" || activePanel === null) && (
          <div className="glass-card rounded-xl p-3 space-y-1 animate-fade-in">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-1 mb-2">
              История чатов
            </p>
            {!user ? (
              <p className="text-xs text-muted-foreground/60 px-1">Войдите для сохранения чатов</p>
            ) : displayChats.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 px-1">Нет чатов</p>
            ) : (
              displayChats.slice(0, 30).map((chat) => {
                const active = currentChatId === chat.id;
                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => handleSelectChat(chat.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors cursor-pointer group ${
                      active
                        ? "ring-2 ring-emerald-500 bg-primary/15"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <p
                      className={`text-xs truncate transition-colors ${
                        active ? "text-primary font-medium" : "text-foreground group-hover:text-primary"
                      }`}
                    >
                      {chat.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(chat.updated_at)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        )}

        {activePanel === "projects" && (
          <div className="glass-card rounded-xl p-3 space-y-2 animate-fade-in">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-1 mb-2">
              Проекты
            </p>
            {["Дом в Истре", "Таунхаус «Сосны»", "ЖК «Изумрудный»", "Дача в Переделкино"].map((name) => (
              <button
                key={name}
                type="button"
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <p className="text-xs text-foreground flex items-center gap-1.5">
                  <FolderOpen className="w-3 h-3 text-primary" />
                  {name}
                </p>
              </button>
            ))}
          </div>
        )}

        {activePanel === "voice" && (
          <div className="glass-card rounded-xl p-4 text-center space-y-3 animate-fade-in">
            <Mic className={`w-8 h-8 mx-auto ${voiceActive ? "text-emerald-500 animate-pulse" : "text-primary"}`} />
            <p className="text-xs text-muted-foreground">
              {voiceActive ? "Слушаю..." : "Голосовой режим"}
            </p>
            <button
              type="button"
              onClick={startVoice}
              className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-xs border border-primary/30 hover:bg-primary/30 transition-colors cursor-pointer"
            >
              🎙 {voiceActive ? "Запись..." : "Начать запись"}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;
