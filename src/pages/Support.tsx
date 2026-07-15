import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Moon, Heart, BookOpen, Sparkles, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Set this to your donation link (Ko-fi, Buy Me a Coffee, PayPal, LaunchGood, etc.)
// Leave empty to hide the donate button until you're ready.
const DONATION_URL = "";

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen starfield geometric-pattern">
      <Helmet>
        <title>Support BinSirin — A Free Islamic Khidma</title>
        <meta
          name="description"
          content="BinSirin is offered freely as an Islamic khidma, seeking only the pleasure of Allah. Support keeps this effort running and growing for the ummah."
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

        <main className="container mx-auto px-4 py-12 sm:py-20">
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
              No premium tier. Every interpretation, the full A–Z dictionary, and the dream journal
              are open to everyone — the elder, the student, the seeker.
            </p>

            <p className="text-base text-muted-foreground mb-10 leading-relaxed">
              This effort is built and maintained so classical Islamic scholarship — Ibn Sirin,
              Al-Nabulsi — reaches Muslims everywhere without barriers. Servers, AI, and scholarly
              curation cost real money each month. If BinSirin has benefited you or your family,
              please consider contributing so it continues and grows.
            </p>

            <div className="dream-card rounded-2xl p-6 sm:p-8 border border-gold/30 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-gold" />
                <h2 className="font-serif text-xl text-gold">Support this effort</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Any amount is deeply appreciated. May Allah reward you and accept it as sadaqah jariyah.
              </p>
              {DONATION_URL ? (
                <a href={DONATION_URL} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-gold text-primary-foreground hover:opacity-90 px-8">
                    <Heart className="w-4 h-4 mr-2" /> Contribute
                  </Button>
                </a>
              ) : (
                <p className="text-xs text-muted-foreground/70 italic">
                  A donation link will be added here soon, inshaAllah.
                </p>
              )}
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
