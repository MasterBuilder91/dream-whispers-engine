import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

const INTERPRET_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interpret-dream`;
const INFOGRAPHIC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-dream-infographic`;

export interface SourceCitation {
  title: string;
  source: string;
  excerpt: string;
}

interface UseInterpretDreamReturn {
  interpretation: string;
  isLoading: boolean;
  sources: SourceCitation[];
  infographicUrl: string | null;
  isGeneratingInfographic: boolean;
  interpretDream: (dreamDescription: string) => Promise<void>;
  reset: () => void;
}

export function useInterpretDream(): UseInterpretDreamReturn {
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<SourceCitation[]>([]);
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);

  const reset = useCallback(() => {
    setInterpretation("");
    setSources([]);
    setInfographicUrl(null);
    setIsGeneratingInfographic(false);
  }, []);

  const generateInfographic = useCallback(async (dreamDescription: string, interpretationText: string) => {
    setIsGeneratingInfographic(true);
    try {
      const response = await fetch(INFOGRAPHIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          dreamDescription,
          interpretation: interpretationText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setInfographicUrl(data.imageUrl);
        }
      } else {
        console.warn("Infographic generation failed:", response.status);
      }
    } catch (error) {
      console.warn("Infographic generation error:", error);
    } finally {
      setIsGeneratingInfographic(false);
    }
  }, []);

  const interpretDream = useCallback(async (dreamDescription: string) => {
    setIsLoading(true);
    setInterpretation("");
    setSources([]);
    setInfographicUrl(null);
    setIsGeneratingInfographic(false);

    let collectedSources: SourceCitation[] = [];

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

      const contentType = response.headers.get("content-type") || "";
      
      // Handle JSON response (no sources found case)
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.noSourcesFound) {
          setInterpretation(data.interpretation);
          setSources([]);
          return;
        }
        throw new Error(data.error || "Unknown error");
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
            
            // Check if this is our sources metadata
            if (parsed.type === "sources" && parsed.sources) {
              collectedSources = parsed.sources;
              setSources(parsed.sources);
              continue;
            }
            
            // Otherwise it's AI content
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
            if (parsed.type === "sources") continue;
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setInterpretation((prev) => prev + content);
            }
          } catch {
            /* ignore */
          }
        }
      }

      // After interpretation completes, generate infographic using the full interpretation text
      // (the edge function extracts real visual symbols from it; we no longer pass citation titles).
      void collectedSources;
      generateInfographic(dreamDescription, interpretation);

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
  }, [generateInfographic]);

  return {
    interpretation,
    isLoading,
    sources,
    infographicUrl,
    isGeneratingInfographic,
    interpretDream,
    reset,
  };
}
