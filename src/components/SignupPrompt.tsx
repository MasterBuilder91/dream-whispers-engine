import { Link } from "react-router-dom";
import { Moon, Stars, BookOpen, TrendingUp, Brain, Download, Crown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface SignupPromptProps {
  variant?: "upgrade-benefits" | "inline" | "chat-limit";
}

export function SignupPrompt({ variant = "upgrade-benefits" }: SignupPromptProps) {
  const { user, subscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  if (variant === "chat-limit") {
    // For logged-in users who hit the limit - show subscription CTA
    if (user) {
      return (
        <Button 
          onClick={handleSubscribe}
          disabled={isLoading}
          className="bg-gradient-gold hover:opacity-90 text-primary-foreground"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
          ) : (
            <Crown className="w-4 h-4 mr-2" />
          )}
          Unlock Unlimited - $4.99/mo
        </Button>
      );
    }
    
    // For guests - show signup CTA
    return (
      <Link to="/auth">
        <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground">
          <MessageCircle className="w-4 h-4 mr-2" />
          Sign Up for More
        </Button>
      </Link>
    );
  }

  // Default: upgrade-benefits - for non-logged-in users
  if (user && !subscription.subscribed) {
    // Logged in but not subscribed
    return (
      <div className="glass-card rounded-2xl p-6 border border-gold/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-semibold">Upgrade to Premium</h3>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Unlimited Conversations</p>
              <p className="text-xs text-muted-foreground">No daily limits. Explore every dream deeply.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Unlimited Journal Storage</p>
              <p className="text-xs text-muted-foreground">Save every dream. Never lose an insight.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">AI Pattern Analysis</p>
              <p className="text-xs text-muted-foreground">Discover recurring symbols and themes.</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
          ) : null}
          Get Premium - $4.99/mo
        </Button>
      </div>
    );
  }

  // Not logged in
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
