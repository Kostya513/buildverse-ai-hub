import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Clock, FolderOpen, Mic, Loader2, Settings as SettingsIcon,
  MoreVertical, Pencil, Copy as CopyIcon, ExternalLink, Share2, Download, Archive, Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useChats, ChatItem } from "@/hooks/useChats";
import { notify } from "@/lib/notify";
import { dispatchChatInput } from "@/lib/chatInputBus";
import ActionConfirmModal from "./ActionConfirmModal";
import ShareChatModal from "./ShareChatModal";

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

/* ───────── Voice mode hook ───────── */
const useVoice = () => {
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  const stop = () => {
    try { recRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  };

  const start = async () => {
    const SR =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) {
      notify.error("Ваш браузер не поддерживает голосовой ввод");
      return;
    }
    if (listening) {
      stop();
      return;
    }
    // Probe microphone permission via getUserMedia (must run from gesture)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      const name = (err as { name?: string })?.name ?? "";
      if (name === "NotAllowedError") notify.error("Разрешение на микрофон не получено");
      else if (name === "NotFoundError") notify.error("Микрофон не найден");
      else notify.error("Не удалось получить доступ к микрофону");
      return;
    }

    try {
      const rec = new (SR as new () => {
        lang: string; continuous: boolean; interimResults: boolean;
        start: () => void; stop: () => void;
        onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> & { length: number } }) => void;
        onerror: (e: { error: string }) => void;
        onend: () => void;
      })();
      rec.lang = "ru-RU";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (e) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
        if (text.trim()) {
          dispatchChatInput(text.trim());
          notify.success("Текст распознан и вставлен в чат");
        }
      };
      rec.onerror = (e) => {
        if (e.error === "aborted" || e.error === "no-speech") {
          // silent: not a hard error
        } else if (e.error === "not-allowed") {
          notify.error("Разрешение на микрофон не получено");
        } else if (e.error === "audio-capture") {
          notify.error("Микрофон не найден");
        } else if (e.error === "network") {
          notify.error("Превышено время ожидания / нет сети");
        } else {
          notify.error(`Ошибка распознавания: ${e.error}`);
        }
        setListening(false);
      };
      rec.onend = () => setListening(false);

      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      notify.error("Не удалось запустить распознавание");
      setListening(false);
    }
  };

  return { listening, start, stop };
};

const RightSidebar = ({
  onNewChat, onSelectChat, currentChatId, expanded, onToggleExpand, chatHook, onOpenSettings,
}: RightSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const localHook = useChats();
  const hook = chatHook ?? localHook;
  const { chats, loadChats, searchChats, renameChat, archiveChat, deleteChat, cloneChat, exportChat } = hook;

  const [activePanel, setActivePanel] = useState<string | null>("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatItem[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ChatItem | null>(null);
  const [shareChatId, setShareChatId] = useState<string | null>(null);

  const voice = useVoice();

  useEffect(() => {
    if (user && !chatHook) loadChats();
  }, [user, loadChats, chatHook]);

  const handleIconClick = (id: string) => {
    if (id === "new") return onNewChat?.();
    if (id === "settings") return onOpenSettings?.();
    if (id === "voice") {
      setActivePanel("voice");
      void voice.start();
      return;
    }
    setActivePanel((prev) => (prev === id ? null : id));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const results = await searchChats(searchQuery);
      setSearchResults(results);
    } catch {
      notify.error("Ошибка поиска");
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

  const submitRename = async () => {
    if (!renamingId) return;
    const id = renamingId;
    const val = renameValue.trim();
    setRenamingId(null);
    if (!val) return;
    await renameChat(id, val);
    notify.success("Чат переименован");
  };

  const handleClone = async (chat: ChatItem) => {
    const newId = await cloneChat(chat.id);
    if (newId) notify.success("Копия чата создана");
    else notify.error("Не удалось клонировать чат");
  };

  const handleGoToProject = (chat: ChatItem) => {
    if (chat.project_id) navigate(`/projects/${chat.project_id}`);
    else notify.info("Чат не связан с проектом");
  };

  const handleDownload = async (chat: ChatItem) => {
    try {
      const json = await exportChat(chat.id);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-${chat.title.replace(/\s+/g, "_").slice(0, 30)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify.success("Чат экспортирован");
    } catch {
      notify.error("Не удалось экспортировать чат");
    }
  };

  const handleArchive = async (chat: ChatItem) => {
    await archiveChat(chat.id);
    notify.success("Чат перемещён в архив");
  };

  /* ───── Chat row with context menu ───── */
  const ChatRow = ({ chat, compact = false }: { chat: ChatItem; compact?: boolean }) => {
    const active = currentChatId === chat.id;
    const isRenaming = renamingId === chat.id;
    return (
      <div
        className={`relative w-full rounded-lg transition-colors group ${
          active ? "ring-2 ring-emerald-500 bg-primary/15" : "hover:bg-white/10"
        }`}
      >
        {isRenaming ? (
          <div className="flex items-center gap-1 px-2 py-1.5">
            <Input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submitRename();
                if (e.key === "Escape") setRenamingId(null);
              }}
              onBlur={() => void submitRename()}
              className="h-7 text-xs bg-white/5 border-white/10"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onSelectChat?.(chat.id)}
            className="w-full text-left px-2.5 py-2 pr-8 rounded-lg cursor-pointer"
          >
            <p className={`text-xs truncate ${active ? "text-primary font-medium" : "text-foreground group-hover:text-primary"}`}>
              {chat.title}
            </p>
            {!compact && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {formatTime(chat.updated_at)}
              </p>
            )}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              aria-label="Действия с чатом"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-background/95 backdrop-blur-xl border-white/10 w-44"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem onClick={() => { setRenamingId(chat.id); setRenameValue(chat.title); }} className="cursor-pointer text-xs">
              <Pencil className="w-3.5 h-3.5 mr-2" /> Переименовать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void handleClone(chat)} className="cursor-pointer text-xs">
              <CopyIcon className="w-3.5 h-3.5 mr-2" /> Клонировать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleGoToProject(chat)} className="cursor-pointer text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-2" /> Перейти в проект
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShareChatId(chat.id)} className="cursor-pointer text-xs">
              <Share2 className="w-3.5 h-3.5 mr-2" /> Поделиться
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => void handleDownload(chat)} className="cursor-pointer text-xs">
              <Download className="w-3.5 h-3.5 mr-2" /> Скачать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleArchive(chat)} className="cursor-pointer text-xs">
              <Archive className="w-3.5 h-3.5 mr-2" /> В архив
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPendingDelete(chat)} className="cursor-pointer text-xs text-destructive focus:text-destructive">
              <Trash2 className="w-3.5 h-3.5 mr-2" /> Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  /* ───── Compact mode ───── */
  if (!expanded) {
    return (
      <>
        <aside className="hidden lg:flex flex-col items-center gap-2 w-12 shrink-0 py-4">
          {iconItems.map((item) => (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => handleIconClick(item.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer
                  ${activePanel === item.id
                    ? "glass-glow bg-primary/20 border border-primary/40"
                    : "glass-card hover:bg-white/10 hover:scale-110"
                  } ${item.id === "voice" && voice.listening ? "ring-2 ring-emerald-500 animate-pulse" : ""}`}
              >
                <item.icon className={`w-4 h-4 ${activePanel === item.id ? "text-primary" : "text-muted-foreground"}`} />
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
        <ShareChatModal open={shareChatId !== null} chatId={shareChatId} onOpenChange={(v) => !v && setShareChatId(null)} />
        <ActionConfirmModal
          open={pendingDelete !== null}
          onOpenChange={(v) => !v && setPendingDelete(null)}
          title="Удалить чат?"
          description={pendingDelete ? `«${pendingDelete.title}» и все сообщения будут удалены безвозвратно.` : ""}
          destructive
          confirmLabel="Удалить"
          successMessage="Чат удалён"
          onConfirm={async () => { if (pendingDelete) await deleteChat(pendingDelete.id); }}
        />
      </>
    );
  }

  /* ───── Expanded mode ───── */
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
              ${activePanel === item.id ? "bg-primary/20 text-primary" : "hover:bg-white/10 text-muted-foreground hover:text-foreground"}
              ${item.id === "voice" && voice.listening ? "ring-2 ring-emerald-500" : ""}`}
          >
            <item.icon className={`w-4 h-4 ${item.id === "voice" && voice.listening ? "animate-pulse text-emerald-500" : ""}`} />
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
                className="bg-white/5 border-white/10 text-xs h-8 pl-8"
              />
            </div>
            {searchResults && (
              <button
                type="button"
                onClick={() => { setSearchResults(null); setSearchQuery(""); }}
                className="text-[10px] text-primary hover:underline cursor-pointer"
              >
                Очистить
              </button>
            )}
            {searching && <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>}
            {searchResults && !searching && searchResults.length === 0 && (
              <p className="text-[10px] text-muted-foreground/60 text-center py-2">Ничего не найдено</p>
            )}
            {searchResults?.map((chat) => <ChatRow key={chat.id} chat={chat} compact />)}
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
              displayChats.slice(0, 30).map((chat) => <ChatRow key={chat.id} chat={chat} />)
            )}
          </div>
        )}

        {activePanel === "projects" && (
          <div className="glass-card rounded-xl p-3 space-y-2 animate-fade-in">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-1 mb-2">Проекты</p>
            {["Дом в Истре", "Таунхаус «Сосны»", "ЖК «Изумрудный»", "Дача в Переделкино"].map((name) => (
              <button key={name} type="button" className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
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
            <Mic className={`w-10 h-10 mx-auto ${voice.listening ? "text-emerald-500 animate-pulse" : "text-primary"}`} />
            <p className="text-xs text-muted-foreground">
              {voice.listening ? "Слушаю... говорите по-русски" : "Голосовой ввод (ru-RU)"}
            </p>
            <button
              type="button"
              onClick={() => (voice.listening ? voice.stop() : void voice.start())}
              className={`px-4 py-2 rounded-lg text-xs border transition-colors cursor-pointer ${
                voice.listening
                  ? "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30"
                  : "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
              }`}
            >
              🎙 {voice.listening ? "Остановить запись" : "Начать запись"}
            </button>
            <p className="text-[10px] text-muted-foreground/70">
              Распознанный текст автоматически вставляется в чат
            </p>
          </div>
        )}
      </div>

      <ShareChatModal open={shareChatId !== null} chatId={shareChatId} onOpenChange={(v) => !v && setShareChatId(null)} />
      <ActionConfirmModal
        open={pendingDelete !== null}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title="Удалить чат?"
        description={pendingDelete ? `«${pendingDelete.title}» и все сообщения будут удалены безвозвратно.` : ""}
        destructive
        confirmLabel="Удалить"
        successMessage="Чат удалён"
        onConfirm={async () => { if (pendingDelete) await deleteChat(pendingDelete.id); }}
      />
    </aside>
  );
};

export default RightSidebar;
