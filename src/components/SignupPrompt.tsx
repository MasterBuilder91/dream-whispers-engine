import { Link } from "react-router-dom";
import { Moon, Stars, BookOpen, TrendingUp, Brain, Download, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignupPromptProps {
  variant: "limit-reached" | "upgrade-benefits" | "inline";
  nextResetDate?: Date | null;
}

export function SignupPrompt({ variant, nextResetDate }: SignupPromptProps) {
  if (variant === "limit-reached") {
    return (
      <div className="glass-card rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto fade-in-up">
        <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gold" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Weekly Limit Reached</h3>
        <p className="text-muted-foreground mb-4">
          You've used your free interpretation this week.
          {nextResetDate && (
            <> Resets {nextResetDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}.</>
          )}
        </p>

        <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Sign up for FREE to unlock:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-gold mt-0.5">✓</span>
              <span><strong>Unlimited interpretations</strong> — no more waiting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold mt-0.5">✓</span>
              <span><strong>Dream journal</strong> — save & revisit your dreams</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold mt-0.5">✓</span>
              <span><strong>Symbol tracking</strong> — see recurring themes</span>
            </li>
          </ul>
        </div>

        <Link to="/auth">
          <Button className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold py-5">
            <Stars className="w-4 h-4 mr-2" />
            Sign Up Free
          </Button>
        </Link>
        
        <p className="text-xs text-muted-foreground mt-4">
          No credit card required. Takes 30 seconds.
        </p>
      </div>
    );
  }

  if (variant === "upgrade-benefits") {
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

  // Inline variant - subtle prompt
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
      <Clock className="w-4 h-4" />
      <span>1 free interpretation per week.</span>
      <Link to="/auth" className="text-gold hover:underline font-medium">
        Sign up for unlimited →
      </Link>
    </div>
  );
}
