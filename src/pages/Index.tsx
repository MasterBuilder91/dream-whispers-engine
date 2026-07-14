import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { DifferentiatorSection } from "@/components/landing/DifferentiatorSection";
import { SourcesShowcase } from "@/components/landing/SourcesShowcase";
import { FAQSection } from "@/components/landing/FAQSection";
import { DreamInput } from "@/components/DreamInput";
import { InterpretationResult } from "@/components/InterpretationResult";
import { DreamInfographic } from "@/components/DreamInfographic";
import { useInterpretDream } from "@/hooks/useInterpretDream";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, BookOpen, RefreshCw, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What makes BinSirin different from other dream interpretation sites?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BinSirin retrieves interpretations directly from the classical texts of Ibn Sirin and Al-Nabulsi. Every response cites the exact source passage — no fabricated meanings, no modern or psychological methods.",
      },
    },
    {
      "@type": "Question",
      name: "How does the engine produce an interpretation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your dream symbols are matched against the classical corpus of Ibn Sirin and Al-Nabulsi. The relevant passages are retrieved and shown alongside the interpretation, so every response can be verified against the original scholarly text.",
      },
    },
    {
      "@type": "Question",
      name: "Is BinSirin free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Dream interpretation is free with no limits. A free account lets you save dreams to a journal. Premium ($4.99/mo) adds unlimited storage, pattern analysis, and mood tracking.",
      },
    },
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BinSirin",
  alternateName: "رفيق الأحلام",
  url: "https://binsirin.com/",
  logo: "https://binsirin.com/pwa-512x512.png",
  description:
    "Authentic Islamic dream interpretation grounded in the classical texts of Ibn Sirin and Al-Nabulsi.",
};


const Index = () => {
  const interpretSectionRef = useRef<HTMLDivElement>(null);
  const { subscription, user } = useAuth();
  const isPremium = subscription.subscribed || subscription.isAdmin;
  const {
    interpretation,
    isLoading,
    sources,
    infographicUrl,
    isGeneratingInfographic,
    limitError,
    interpretDream,
    reset,
  } = useInterpretDream({ canUseInfographic: isPremium });

  const handleDreamSubmit = (dream: string) => {
    interpretDream(dream);
  };

  return (
    <div className="min-h-screen starfield geometric-pattern">
      <Helmet>
        <title>BinSirin | Authentic Islamic Dream Interpretation</title>
        <meta name="description" content="Describe your dream and receive an authentic interpretation grounded in Ibn Sirin and Al-Nabulsi's classical texts — every response cited." />
        <link rel="canonical" href="https://binsirin.com/" />
        <meta property="og:title" content="BinSirin | Authentic Islamic Dream Interpretation" />
        <meta property="og:description" content="Authentic Islamic dream interpretation grounded in Ibn Sirin & Al-Nabulsi. Every response cited to the classical text." />
        <meta property="og:url" content="https://binsirin.com/" />
        <script type="application/ld+json">{JSON.stringify(organizationJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg text-gold tracking-wide">BinSirin</span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm">
            <a href="/dictionary" className="text-muted-foreground hover:text-gold transition-colors">
              Dictionary
            </a>
            <Link to="/pricing" className="text-muted-foreground hover:text-gold transition-colors">
              Pricing
            </Link>
            <a href="#faq" className="text-muted-foreground hover:text-gold transition-colors">
              FAQ
            </a>
            {user ? (
              <Link to="/journal" className="text-muted-foreground hover:text-gold transition-colors">
                Journal
              </Link>
            ) : (
              <Link to="/auth" className="text-gold hover:opacity-80 transition-opacity">
                Sign in
              </Link>
            )}
          </div>
        </nav>

        <main>
        {/* Dream Input Section - the tool is the first thing you see */}
        <section ref={interpretSectionRef} className="pt-8 pb-12 sm:pt-12 sm:pb-20" id="interpret">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-gradient-gold mb-3 sm:mb-4">
                BinSirin — Authentic Islamic Dream Interpretation
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Describe your dream and receive authentic interpretations from classical Islamic scholars.
              </p>
            </div>

            <DreamInput
              onSubmit={handleDreamSubmit}
              isLoading={isLoading}
              disabled={false}
            />

            <InterpretationResult
              interpretation={interpretation}
              isStreaming={isLoading}
              sources={sources}
            />

            <DreamInfographic
              imageUrl={infographicUrl}
              isGenerating={isGeneratingInfographic}
            />

            {interpretation && !isLoading && (
              <div className="w-full max-w-3xl mx-auto mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={reset}
                  className="border-gold/30 hover:bg-gold/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Dream
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Differentiator Section */}
        <DifferentiatorSection />

        {/* Sources Showcase */}
        <SourcesShowcase />


        {/* FAQ Section */}
        <FAQSection />
        </main>



        {/* Footer */}
        <footer className="border-t border-border py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                  <Moon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-serif text-lg text-gold">BinSirin</p>
                  <p className="text-xs text-muted-foreground">رفيق الأحلام</p>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center sm:justify-end">
                  <BookOpen className="w-4 h-4" />
                  Powered by Ibn Sirin & Al-Nabulsi's Classical Texts
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Primary sources only. No fabrication. No gatekeeping.
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground/50">
                © {new Date().getFullYear()} BinSirin. 
                All interpretations grounded in and cited from classical scholarly texts.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
