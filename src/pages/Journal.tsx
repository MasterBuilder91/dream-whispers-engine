import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Plus, LogOut, Loader2, BookOpen, Calendar, Trash2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface DreamEntry {
  id: string;
  dream_text: string;
  interpretation: string | null;
  sources: unknown;
  symbols: string[] | null;
  mood: string | null;
  created_at: string;
}

export default function Journal() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Fetch dreams
  useEffect(() => {
    async function fetchDreams() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("user_dreams")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDreams(data || []);
      } catch (error) {
        console.error("Error fetching dreams:", error);
        toast.error("Failed to load your dreams");
      } finally {
        setLoading(false);
      }
    }

    fetchDreams();
  }, [user]);

  const handleDeleteDream = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_dreams")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setDreams(dreams.filter(d => d.id !== id));
      toast.success("Dream deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete dream");
    }
  };


  if (authLoading) {
    return (
      <div className="min-h-screen starfield geometric-pattern flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen starfield geometric-pattern">
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <Moon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-serif text-lg text-gold">BinSirin</span>
            </a>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Welcome & Stats */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif text-gradient-gold mb-2">
              Your Dream Journal
            </h1>
            <p className="text-muted-foreground">
              {user?.email} • {dreams.length} dream{dreams.length !== 1 ? "s" : ""} recorded
            </p>
          </div>

          {/* Support banner */}
          <div className="glass-card rounded-xl p-6 mb-8 border border-gold/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-gold" />
                  <h3 className="font-semibold text-lg">A free Islamic khidma</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  BinSirin is offered freely, seeking only the pleasure of Allah. Your support keeps it running for the ummah.
                </p>
              </div>
              <Button
                onClick={() => navigate("/support")}
                className="bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold shrink-0"
              >
                <Heart className="w-4 h-4 mr-2" />
                Support this effort
              </Button>
            </div>
          </div>

          {/* New Dream Button */}
          <div className="mb-6">
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-gold hover:opacity-90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Interpret New Dream
            </Button>
          </div>

          {/* Dreams List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : dreams.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No dreams yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your journey by interpreting your first dream
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-gold hover:opacity-90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Interpret Your First Dream
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {dreams.map((dream) => (
                <div
                  key={dream.id}
                  className="glass-card rounded-xl p-5 hover:border-gold/30 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(dream.created_at), "MMM d, yyyy 'at' h:mm a")}
                        {dream.mood && (
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                            {dream.mood}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground line-clamp-2 mb-2">
                        {dream.dream_text}
                      </p>
                      {dream.interpretation && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {dream.interpretation.substring(0, 150)}...
                        </p>
                      )}
                      {dream.symbols && dream.symbols.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {dream.symbols.slice(0, 5).map((symbol, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs"
                            >
                              {symbol}
                            </span>
                          ))}
                          {dream.symbols.length > 5 && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                              +{dream.symbols.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDream(dream.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
