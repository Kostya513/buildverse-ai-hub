import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ChatItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const useChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadChats = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setChats(data as ChatItem[]);
  }, [user]);

  const createChat = useCallback(async (title = "Новый чат"): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title })
      .select()
      .single();
    if (error || !data) return null;
    const chat = data as ChatItem;
    setChats((prev) => [chat, ...prev]);
    setCurrentChatId(chat.id);
    setMessages([]);
    return chat.id;
  }, [user]);

  const loadMessages = useCallback(async (chatId: string) => {
    if (!user) return;
    setCurrentChatId(chatId);
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
    setLoading(false);
  }, [user]);

  const sendMessage = useCallback(async (content: string, role: "user" | "assistant" = "user") => {
    if (!user || !currentChatId) return;
    const { data } = await supabase
      .from("messages")
      .insert({ chat_id: currentChatId, user_id: user.id, role, content })
      .select()
      .single();
    if (data) {
      setMessages((prev) => [...prev, data as ChatMessage]);
      // Update chat title from first user message
      if (role === "user" && messages.length === 0) {
        const title = content.slice(0, 60);
        await supabase.from("chats").update({ title }).eq("id", currentChatId);
        setChats((prev) => prev.map((c) => c.id === currentChatId ? { ...c, title } : c));
      }
    }
  }, [user, currentChatId, messages.length]);

  const searchChats = useCallback(async (query: string): Promise<ChatItem[]> => {
    if (!user || !query.trim()) return [];
    const { data } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.id)
      .ilike("title", `%${query}%`)
      .order("updated_at", { ascending: false })
      .limit(10);
    return (data as ChatItem[]) || [];
  }, [user]);

  return {
    chats, currentChatId, messages, loading,
    loadChats, createChat, loadMessages, sendMessage, searchChats,
    setCurrentChatId, setMessages,
  };
};
