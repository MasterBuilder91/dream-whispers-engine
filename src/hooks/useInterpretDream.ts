import { useState, useCallback } from "react";
import { searchDreamEntries, DreamEntry } from "@/lib/dreamDatabase";
import { toast } from "@/hooks/use-toast";

const INTERPRET_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interpret-dream`;

interface UseInterpretDreamReturn {
  interpretation: string;
  isLoading: boolean;
  sourcesUsed: number;
  interpretDream: (dreamDescription: string) => Promise<void>;
  reset: () => void;
}

// Extract key Arabic/English symbols from dream description
function extractKeywords(text: string): string[] {
  // Common dream symbols in Arabic and English
  const symbols = [
    // Arabic symbols
    'ماء', 'نار', 'بحر', 'نهر', 'جبل', 'شمس', 'قمر', 'نجم', 'سماء',
    'ميت', 'موت', 'زواج', 'عرس', 'طفل', 'ولد', 'بنت', 'أم', 'أب',
    'بيت', 'منزل', 'سيارة', 'طائرة', 'قطار', 'سفر', 'طريق',
    'ذهب', 'فضة', 'مال', 'ثوب', 'لباس', 'طعام', 'خبز', 'لحم',
    'أسد', 'حية', 'ثعبان', 'كلب', 'قط', 'طير', 'حمام', 'نحل',
    'صلاة', 'مسجد', 'قرآن', 'حج', 'كعبة', 'رسول', 'نبي',
    'دم', 'بكاء', 'ضحك', 'خوف', 'فرح', 'حزن', 'غضب',
    'شعر', 'أسنان', 'عين', 'يد', 'قدم', 'رأس',
    'شجرة', 'وردة', 'حديقة', 'بستان', 'ثمر',
    'سجن', 'قصر', 'مدينة', 'قرية', 'سوق',
    // English symbols
    'water', 'fire', 'sea', 'river', 'mountain', 'sun', 'moon', 'star', 'sky',
    'dead', 'death', 'marriage', 'wedding', 'child', 'baby', 'mother', 'father',
    'house', 'home', 'car', 'plane', 'train', 'travel', 'road', 'path',
    'gold', 'silver', 'money', 'clothes', 'food', 'bread',
    'lion', 'snake', 'dog', 'cat', 'bird', 'fish',
    'prayer', 'mosque', 'quran', 'hajj', 'prophet',
    'blood', 'cry', 'laugh', 'fear', 'joy', 'sad', 'angry',
    'hair', 'teeth', 'eye', 'hand', 'foot', 'head',
    'tree', 'flower', 'garden', 'fruit',
    'prison', 'palace', 'city', 'market'
  ];
  
  const foundSymbols: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const symbol of symbols) {
    if (text.includes(symbol) || lowerText.includes(symbol.toLowerCase())) {
      foundSymbols.push(symbol);
    }
  }
  
  // Also extract words that might be symbols (nouns)
  const words = text.split(/[\s,،.؟?!]+/).filter(w => w.length > 2);
  
  return [...new Set([...foundSymbols, ...words.slice(0, 10)])];
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
      // Step 1: Extract keywords and search the databases
      const keywords = extractKeywords(dreamDescription);
      console.log("Extracted keywords:", keywords);
      
      let databaseEntries: DreamEntry[] = [];
      
      if (keywords.length > 0) {
        const searchResult = await searchDreamEntries(keywords);
        databaseEntries = searchResult.entries;
        setSourcesUsed(searchResult.entries.length);
        console.log(`Found ${searchResult.entries.length} relevant entries`);
      }

      // Step 2: Call the AI interpretation endpoint
      const response = await fetch(INTERPRET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          dreamDescription,
          databaseEntries: databaseEntries.map(e => ({
            title: e.title,
            content: e.content,
            source: e.source,
          })),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Credits Exhausted",
            description: "AI credits have run out. Please add credits to continue.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to interpret dream");
      }

      // Step 3: Stream the response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process SSE lines
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              setInterpretation(prev => prev + content);
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
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
              setInterpretation(prev => prev + content);
            }
          } catch { /* ignore */ }
        }
      }

    } catch (error) {
      console.error("Error interpreting dream:", error);
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
