import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Moon, Heart, BookOpen, Sparkles, HandHeart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500, 1000] as const;

export default function Support() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<number | "custom">(50);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Post-checkout messaging
  useEffect(() => {
    const donation = searchParams.get("donation");
    if (donation === "success") {
      toast.success("JazakAllah khair — your support means everything.", { duration: 8000 });
      searchParams.delete("donation");
      setSearchParams(searchParams, { replace: true });
    } else if (donation === "canceled") {
      toast.info("Donation canceled — no charge was made.");
      searchParams.delete("donation");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const activeAmount = (): number | null => {
    if (selected === "custom") {
      const n = Number(customAmount);
      return Number.isFinite(n) && n >= 1 ? n : null;
    }
    return selected;
  };

  const handleDonate = async () => {
    const amount = activeAmount();
    if (!amount || amount < 1) {
      toast.error("Please enter an amount of at least $1.");
      return;
    }
    if (amount > 10000) {
      toast.error("For amounts over $10,000, please contact us directly.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-donation", {
        body: { amount },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen starfield geometric-pattern">
      <Helmet>
        <title>Support BinSirin — A Free Islamic Khidma</title>
        <meta
          name="description"
          content="BinSirin is offered freely as an Islamic khidma, seeking only the pleasure of Allah. Your donation keeps this effort running and growing for the ummah."
        />
        <link rel="canonical" href="https://binsirin.com/support" />
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
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-gold mb-6 shadow-lg shadow-gold/30">
              <HandHeart className="w-8 h-8 text-primary-foreground" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-serif text-gradient-gold mb-6">
              A free khidma for the ummah
            </h1>

            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              BinSirin is offered <strong className="text-foreground">completely free</strong>,
              seeking only the pleasure of Allah <span className="text-sm">ﷻ</span>. No paywall.
              Every interpretation, the full A–Z dictionary, and the dream journal are open to
              everyone — the elder, the student, the seeker.
            </p>

            <p className="text-base text-muted-foreground mb-10 leading-relaxed">
              Servers, AI, and scholarly curation cost real money each month. If BinSirin has
              benefited you or your family, please consider contributing so it continues and grows.
            </p>

            {/* Donation card */}
            <div className="dream-card rounded-2xl p-6 sm:p-8 border border-gold/30 mb-8 text-left">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-xl text-gold">Choose an amount</h2>
              </div>
              <p className="text-xs text-center text-muted-foreground mb-6">
                Secure one-time donation via Stripe. Any amount is deeply appreciated.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                {PRESET_AMOUNTS.map((amt) => {
                  const isActive = selected === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelected(amt);
                        setCustomAmount("");
                      }}
                      className={`rounded-xl border py-3 px-2 text-center font-medium transition-all ${
                        isActive
                          ? "border-gold bg-gradient-gold text-primary-foreground shadow-md shadow-gold/30"
                          : "border-border bg-secondary/40 hover:border-gold/50 hover:bg-gold/10 text-foreground"
                      }`}
                    >
                      ${amt.toLocaleString()}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelected("custom")}
                  className={`rounded-xl border py-3 px-2 text-center font-medium transition-all ${
                    selected === "custom"
                      ? "border-gold bg-gradient-gold text-primary-foreground shadow-md shadow-gold/30"
                      : "border-border bg-secondary/40 hover:border-gold/50 hover:bg-gold/10 text-foreground"
                  }`}
                >
                  Custom
                </button>
              </div>

              {selected === "custom" && (
                <div className="mb-4">
                  <label htmlFor="custom-amount" className="text-xs text-muted-foreground block mb-1">
                    Enter amount (USD, $1–$10,000)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="custom-amount"
                      type="number"
                      min={1}
                      max={10000}
                      step="1"
                      inputMode="decimal"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="pl-7 bg-secondary/50 border-border focus:border-gold text-lg"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleDonate}
                disabled={loading || activeAmount() === null}
                className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 py-6 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting to checkout…
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Contribute {activeAmount() ? `$${activeAmount()!.toLocaleString()}` : ""}
                  </>
                )}
              </Button>

              <p className="text-[11px] text-center text-muted-foreground/70 mt-4">
                May Allah reward you and accept it as sadaqah jariyah.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-left mb-10">
              <div className="dream-card rounded-xl p-4">
                <BookOpen className="w-5 h-5 text-gold mb-2" />
                <p className="text-sm font-medium mb-1">Share it</p>
                <p className="text-xs text-muted-foreground">Tell family, friends, and your local masjid.</p>
              </div>
              <div className="dream-card rounded-xl p-4">
                <Sparkles className="w-5 h-5 text-gold mb-2" />
                <p className="text-sm font-medium mb-1">Make du'a</p>
                <p className="text-xs text-muted-foreground">A sincere du'a for this khidma is a gift.</p>
              </div>
              <div className="dream-card rounded-xl p-4">
                <Heart className="w-5 h-5 text-gold mb-2" />
                <p className="text-sm font-medium mb-1">Contribute</p>
                <p className="text-xs text-muted-foreground">Any amount helps cover monthly costs.</p>
              </div>
            </div>

            <Button variant="outline" onClick={() => navigate("/")} className="border-gold/30 hover:bg-gold/10">
              ← Back to BinSirin
            </Button>

            <p className="text-xs text-muted-foreground/60 mt-10 italic">
              "The best of people are those most beneficial to people." — Prophet Muhammad ﷺ
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
