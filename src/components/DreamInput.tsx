import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Moon, Sparkles, Lock } from "lucide-react";

interface DreamInputProps {
  onSubmit: (dream: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}

export function DreamInput({ onSubmit, isLoading, disabled, disabledMessage }: DreamInputProps) {
  const [dream, setDream] = useState("");

  const handleSubmit = () => {
    if (dream.trim() && !isLoading && !disabled) {
      onSubmit(dream.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift for new lines)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className={`dream-card rounded-2xl p-4 sm:p-6 md:p-8 glow-border ${disabled ? "opacity-60" : ""}`}>
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif text-gradient-gold">صف رؤياك</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Describe your dream</p>
          </div>
        </div>

        <div className="relative">
          <Textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب تفاصيل حلمك هنا... / Describe your dream here..."
            className="min-h-[140px] sm:min-h-[180px] bg-secondary/30 border-border/50 resize-none text-base sm:text-lg leading-relaxed placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all rounded-xl"
            dir="auto"
            enterKeyHint="send"
            disabled={disabled}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          {disabled ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              {disabledMessage || "Interpretation unavailable"}
            </span>
          ) : isLoading ? (
            <span className="flex items-center gap-2 text-gold">
              <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              جاري التفسير... Interpreting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="font-medium">Press Enter ↵ to start interpretation</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
