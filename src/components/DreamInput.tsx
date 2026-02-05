import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Moon, Sparkles, Send } from "lucide-react";

interface DreamInputProps {
  onSubmit: (dream: string) => void;
  isLoading: boolean;
}

export function DreamInput({ onSubmit, isLoading }: DreamInputProps) {
  const [dream, setDream] = useState("");

  const handleSubmit = () => {
    if (dream.trim() && !isLoading) {
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
      <div className="dream-card rounded-2xl p-4 sm:p-6 md:p-8 glow-border">
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
          />
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-2 text-xs text-muted-foreground/70">
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Press Enter to submit</span>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:gap-4">
          <Button
            onClick={handleSubmit}
            disabled={!dream.trim() || isLoading}
            size="lg"
            className="w-full sm:w-auto sm:self-end bg-gradient-gold hover:opacity-90 text-primary-foreground font-medium px-8 py-6 sm:py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 text-base"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                جاري التفسير...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                فسّر الحلم
              </span>
            )}
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:hidden">
            سيتم تحليل حلمك باستخدام كتب ابن سيرين والنابلسي
          </p>
        </div>
      </div>
    </div>
  );
}
