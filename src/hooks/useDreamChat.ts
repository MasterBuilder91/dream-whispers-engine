import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const INTERPRET_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interpret-dream`;
const DAILY_MESSAGE_LIMIT = 20;
const LOCAL_STORAGE_KEY = "dream_chat_messages";

export interface SourceCitation {
  title: string;
  source: string;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  timestamp: Date;
}

interface MessageCount {
  count: number;
  date: string; // YYYY-MM-DD
}

interface UseDreamChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
  remainingMessages: number;
  isLimitReached: boolean;
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getLocalMessageCount(): MessageCount {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data: MessageCount = JSON.parse(stored);
      // Reset if it's a new day
      if (data.date !== getTodayString()) {
        return { count: 0, date: getTodayString() };
      }
      return data;
    }
  } catch {
    // Ignore parse errors
  }
  return { count: 0, date: getTodayString() };
}

function setLocalMessageCount(count: number): void {
  const data: MessageCount = { count, date: getTodayString() };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

export function useDreamChat(): UseDreamChatReturn {
  const { user, subscription } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const isPremium = subscription.subscribed || subscription.isAdmin;
  useEffect(() => {
    const loadMessageCount = async () => {
      if (user) {
        // For logged-in users, get count from database
        try {
          const today = getTodayString();
          const { data, error } = await supabase
            .from("user_dreams")
            .select("id", { count: "exact" })
            .eq("user_id", user.id)
            .gte("created_at", `${today}T00:00:00Z`)
            .lte("created_at", `${today}T23:59:59Z`);
          
          if (!error && data) {
            setMessageCount(data.length);
          }
        } catch (err) {
          console.error("Error loading message count:", err);
        }
      } else {
        // For guests, use localStorage
        const local = getLocalMessageCount();
        setMessageCount(local.count);
      }
    };

    loadMessageCount();
  }, [user]);

  const remainingMessages = isPremium ? Infinity : Math.max(0, DAILY_MESSAGE_LIMIT - messageCount);
  const isLimitReached = !isPremium && messageCount >= DAILY_MESSAGE_LIMIT;

  const resetChat = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (isLimitReached) {
      toast({
        title: "Daily limit reached",
        description: "Subscribe to continue exploring your dreams.",
        variant: "destructive",
      });
      return;
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Increment message count
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    if (!user) {
      setLocalMessageCount(newCount);
    }

    // Prepare conversation history for API
    const conversationHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    conversationHistory.push({ role: "user", content });

    try {
      const response = await fetch(INTERPRET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          dreamDescription: content,
          conversationHistory,
          isFollowUp: messages.length > 0,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please wait and try again.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Credits Exhausted",
            description: "AI credits have run out.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to get interpretation");
      }

      // Create assistant message placeholder
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        sources: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";
      let sources: SourceCitation[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);

            // Check if this is sources metadata
            if (parsed.type === "sources" && parsed.sources) {
              sources = parsed.sources;
              setMessages((prev) => 
                prev.map((m) => 
                  m.id === assistantMessage.id ? { ...m, sources } : m
                )
              );
              continue;
            }

            // Otherwise it's AI content
            const contentDelta = parsed.choices?.[0]?.delta?.content;
            if (contentDelta) {
              assistantContent += contentDelta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id 
                    ? { ...m, content: assistantContent } 
                    : m
                )
              );
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.type === "sources") continue;
            const contentDelta = parsed.choices?.[0]?.delta?.content;
            if (contentDelta) {
              assistantContent += contentDelta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id 
                    ? { ...m, content: assistantContent } 
                    : m
                )
              );
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      // Remove the failed assistant message placeholder if it was added
      setMessages((prev) => prev.filter((m) => m.role !== "assistant" || m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  }, [messages, messageCount, user, isLimitReached]);

  return {
    messages,
    isLoading,
    sendMessage,
    resetChat,
    remainingMessages,
    isLimitReached,
  };
}
