import { useState, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

const INTERPRET_URL = "/api/interpret-dream";
const INFOGRAPHIC_URL = "/api/generate-infographic";

export interface SourceCitation {
  title: string;
  source: string;
  excerpt: string;
}

export interface LimitError {
  reason: "rate_limited" | "monthly_limit" | "anon_limit";
  message: string;
  used: number;
  limit: number;
  retryAfter?: number | null;
}

interface UseInterpretDreamReturn {
  interpretation: string;
  isLoading: boolean;
  sources: SourceCitation[];
  infographicUrl: string | null;
  isGeneratingInfographic: boolean;
  limitError: LimitError | null;
  interpretDream: (dreamDescription: string) => Promise<void>;
  requestInfographic: () => Promise<void>;
  reset: () => void;
}

export function useInterpretDream(): UseInterpretDreamReturn {
  const lastDreamRef = useRef("");
  const lastInterpretationRef = useRef("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<SourceCitation[]>([]);
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);
  const [limitError, setLimitError] = useState<LimitError | null>(null);

  const reset = useCallback(() => {
    setInterpretation("");
    setSources([]);
    setInfographicUrl(null);
    setIsGeneratingInfographic(false);
    setLimitError(null);
  }, []);

  const requestInfographic = useCallback(async () => {
    const dreamDescription = lastDreamRef.current;
    const interpretationText = lastInterpretationRef.current;
    if (!dreamDescription || !interpretationText) return;
    setIsGeneratingInfographic(true);
    try {
      const response = await fetch(INFOGRAPHIC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamDescription, interpretation: interpretationText }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) setInfographicUrl(data.imageUrl);
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
    setLimitError(null);
    lastDreamRef.current = dreamDescription;
    lastInterpretationRef.current = "";

    let collectedSources: SourceCitation[] = [];
    let fullInterpretation = "";

    try {
      const response = await fetch(INTERPRET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamDescription }),
      });

      if (!response.ok) {
        // Free-tier / rate-limit responses come back as JSON with `error` codes.
        if (response.status === 429 || response.status === 402) {
          try {
            const data = await response.json();
            if (data?.error === "rate_limited" || data?.error === "monthly_limit" || data?.error === "anon_limit") {
              setLimitError({
                reason: data.error,
                message: data.message ?? "Limit reached.",
                used: data.used ?? 0,
                limit: data.limit ?? 0,
                retryAfter: data.retry_after ?? null,
              });
              return;
            }
            if (response.status === 429) {
              toast({ title: "Rate Limited", description: "Please wait and try again.", variant: "destructive" });
              return;
            }
            toast({ title: "Credits Exhausted", description: "AI credits have run out.", variant: "destructive" });
            return;
          } catch {
            toast({ title: "Error", description: "Request failed.", variant: "destructive" });
            return;
          }
        }
        throw new Error("Failed to get interpretation");
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.noSourcesFound) {
          setInterpretation(data.interpretation);
          setSources([]);
          return;
        }
        throw new Error(data.error || "Unknown error");
      }

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
            if (parsed.type === "sources" && parsed.sources) {
              collectedSources = parsed.sources;
              setSources(parsed.sources);
              continue;
            }
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullInterpretation += content;
              setInterpretation((prev) => prev + content);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

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
              fullInterpretation += content;
              setInterpretation((prev) => prev + content);
            }
          } catch {
            /* ignore */
          }
        }
      }

      void collectedSources;
      lastInterpretationRef.current = fullInterpretation;
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
    sources,
    infographicUrl,
    isGeneratingInfographic,
    limitError,
    interpretDream,
    requestInfographic,
    reset,
  };
}
