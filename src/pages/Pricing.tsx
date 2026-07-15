import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Moon, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, SUBSCRIPTION_TIERS } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const freePerks = [
  "3 free trial interpretations (lifetime)",
  "Sourced answers from Ibn Sirin & Al-Nabulsi",
  "Arabic + English, every response cited",
  "Unlimited A–Z symbol dictionary — browse forever",
  "Save your last 5 dreams",
];

const premiumPerks = [
  "Unlimited dream interpretations",
  "Shareable dream infographic for every dream",
  "Unlimited dream journal + search",
  "Monthly mood & symbol trend analysis",
  "PDF export of any interpretation",
  "Priority AI model, faster responses",
  "Ad-free forever",
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    if (!user) {
      navigate("/auth?next=/pricing");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error("Could not start checkout.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isPremium = subscription.subscribed || subscription.isAdmin;

  return (
    <div className="min-h-screen starfield geometric-pattern">
      <Helmet>
        <title>Pricing — BinSirin Premium | Unlimited Dream Interpretation</title>
        <meta
          name="description"
          content="Try BinSirin free — 3 trial dream interpretations, no card required. Upgrade to Premium ($4.99/mo) for unlimited interpretations, shareable infographics, and trend analysis. Dictionary and journal always free."
        />
        <link rel="canonical" href="https://binsirin.com/pricing" />
      </Helmet>

      <div className="relative z-10">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg text-gold tracking-wide">BinSirin</span>
          </button>
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <a href="/dictionary" className="text-muted-foreground hover:text-gold">Dictionary</a>
            <a href="/#faq" className="text-muted-foreground hover:text-gold">FAQ</a>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-serif text-gradient-gold mb-4">
              Honest pricing. Real scholarship.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A human interpreter charges $20–100 per dream and often mixes in superstition.
              BinSirin grounds every answer in Ibn Sirin and Al-Nabulsi — for the price of a coffee per month.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="dream-card rounded-2xl p-8">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Seeker</p>
                <p className="text-4xl font-serif text-foreground">Free</p>
                <p className="text-sm text-muted-foreground mt-1">Forever — no card required.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {freePerks.map((perk) => (
                  <li key={perk} className="flex gap-3 text-sm">
                    <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full border-gold/30 hover:bg-gold/10"
                onClick={() => navigate("/")}
              >
                Start interpreting
              </Button>
            </div>

            {/* Premium */}
            <div className="dream-card rounded-2xl p-8 relative border-gold/40 ring-1 ring-gold/20">
              <div className="absolute -top-3 right-6 bg-gradient-gold text-primary-foreground text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most popular
              </div>
              <div className="mb-6">
                <p className="text-sm uppercase tracking-widest text-gold mb-2">Premium</p>
                <p className="text-4xl font-serif text-gradient-gold">
                  {SUBSCRIPTION_TIERS.premium.price}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Or ~$39/year. Cancel anytime.
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {premiumPerks.map((perk) => (
                  <li key={perk} className="flex gap-3 text-sm">
                    <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              {isPremium ? (
                <Button disabled className="w-full bg-gradient-gold text-primary-foreground">
                  {subscription.isAdmin ? "Admin access" : "You're on Premium"}
                </Button>
              ) : (
                <Button
                  onClick={startCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting checkout…</>
                  ) : (
                    "Upgrade to Premium"
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-16 text-center text-sm text-muted-foreground space-y-2">
            <p>
              The A–Z dream symbol dictionary stays free for everyone — because scholarship
              shouldn't be gatekept.
            </p>
            <p>
              Questions? Read the <a href="/#faq" className="text-gold hover:underline">FAQ</a>.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
