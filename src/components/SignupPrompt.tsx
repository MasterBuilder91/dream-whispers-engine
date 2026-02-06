import { Link } from "react-router-dom";
import { Moon, Stars, BookOpen, TrendingUp, Brain, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignupPromptProps {
  variant?: "upgrade-benefits" | "inline";
}

export function SignupPrompt({ variant = "upgrade-benefits" }: SignupPromptProps) {
  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
        <Stars className="w-4 h-4 text-gold" />
        <span>Save your dreams & track patterns.</span>
        <Link to="/auth" className="text-gold hover:underline font-medium">
          Create free account →
        </Link>
      </div>
    );
  }

  // Default: upgrade-benefits
  return (
    <div className="glass-card rounded-2xl p-6 border border-gold/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
          <Moon className="w-4 h-4 text-primary-foreground" />
        </div>
        <h3 className="font-semibold">Unlock Your Dream Journey</h3>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Dream Journal</p>
            <p className="text-xs text-muted-foreground">Save every dream. Never lose an insight.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Pattern Detection</p>
            <p className="text-xs text-muted-foreground">AI finds recurring symbols across your history.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Mood Insights</p>
            <p className="text-xs text-muted-foreground">Track emotional patterns over time.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Export & Backup</p>
            <p className="text-xs text-muted-foreground">Download your complete dream history.</p>
          </div>
        </div>
      </div>

      <Link to="/auth">
        <Button className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground">
          Get Started Free
        </Button>
      </Link>
    </div>
  );
}
