import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

const INTERPRET_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interpret-dream`;

interface UseInterpretDreamReturn {
  interpretation: string;
  isLoading: boolean;
  sourcesUsed: number;
  interpretDream: (dreamDescription: string) => Promise<void>;
  reset: () => void;
}

export function useInterpretDream(): UseInterpretDreamReturn {
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sourcesUsed, setSourcesUsed] = useState(0);

  const reset = useCallback(() => {
    setInterpretation("");
    setSourcesUsed(0);
  }, []);

  const interpretDream = useCallback(async (dreamDescription: string) => {
    setIsLoading(true);
    setInterpretation("");
    setSourcesUsed(0);

    try {
      const response = await fetch(INTERPRET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ dreamDescription }),
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

      // Get sources count from response header
      const sourcesHeader = response.headers.get("X-Sources-Used");
      if (sourcesHeader) {
        setSourcesUsed(parseInt(sourcesHeader, 10) || 0);
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

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
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setInterpretation((prev) => prev + content);
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
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setInterpretation((prev) => prev + content);
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (error) {
      console.error("Interpretation error:", error);
      toast({
        title: "Error",
        description: "Failed to interpret dream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    interpretation,
    isLoading,
    sourcesUsed,
    interpretDream,
    reset,
  };
}
