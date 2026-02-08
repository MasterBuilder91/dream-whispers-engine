import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HeroSection } from "@/components/landing/HeroSection";
import { DifferentiatorSection } from "@/components/landing/DifferentiatorSection";
import { SourcesShowcase } from "@/components/landing/SourcesShowcase";
import { FAQSection } from "@/components/landing/FAQSection";
import { DreamInput } from "@/components/DreamInput";
import { InterpretationResult } from "@/components/InterpretationResult";
import { DreamChat } from "@/components/DreamChat";
import { useInterpretDream } from "@/hooks/useInterpretDream";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, BookOpen, User, Crown, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, subscription } = useAuth();
  const interpretSectionRef = useRef<HTMLDivElement>(null);
  const { interpretation, isLoading, sources, interpretDream, reset } = useInterpretDream();
  const [showChat, setShowChat] = useState(false);
  const [initialDream, setInitialDream] = useState("");

  const scrollToInterpret = () => {
    interpretSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDreamSubmit = (dream: string) => {
    setInitialDream(dream);
    setShowChat(false);
    interpretDream(dream);
  };

  const handleNewDream = () => {
    reset();
    setShowChat(false);
    setInitialDream("");
  };

  const handleContinueChat = () => {
    setShowChat(true);
  };

  return (
    <div className="min-h-screen starfield geometric-pattern">
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
              <Moon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg text-gold">تفسير الأحلام</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            <div className="hidden sm:flex items-center gap-6">
              <a href="#why-different" className="text-muted-foreground hover:text-gold transition-colors">
                Why Different
              </a>
              <a href="#sources" className="text-muted-foreground hover:text-gold transition-colors">
                Sources
              </a>
              <a href="#faq" className="text-muted-foreground hover:text-gold transition-colors">
                FAQ
              </a>
            </div>
            
            {user ? (
              <Link to="/journal">
                <Button variant="outline" size="sm" className="border-gold/30 hover:bg-gold/10">
                  {subscription.subscribed && <Crown className="w-3.5 h-3.5 mr-1.5 text-gold" />}
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Journal
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-gold/30 hover:bg-gold/10">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <HeroSection onStartInterpreting={scrollToInterpret} />

        {/* Differentiator Section */}
        <DifferentiatorSection />

        {/* Sources Showcase */}
        <SourcesShowcase />

        {/* Dream Input Section */}
        <section ref={interpretSectionRef} className="py-12 sm:py-20" id="interpret">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-gold mb-4">
                Interpret Your Dream
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Describe your dream and receive authentic interpretations from classical Islamic scholars.
              </p>
            </div>

            {!showChat ? (
              <>
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

                {/* Action buttons after interpretation */}
                {interpretation && !isLoading && (
                  <div className="w-full max-w-3xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      onClick={handleContinueChat}
                      className="bg-gradient-gold hover:opacity-90 text-primary-foreground"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask Follow-up Questions
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNewDream}
                      className="border-gold/30 hover:bg-gold/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      New Dream
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <DreamChat initialDream={initialDream} initialInterpretation={interpretation} />
                <div className="w-full max-w-3xl mx-auto mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleNewDream}
                    className="border-gold/30 hover:bg-gold/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start New Dream
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <footer className="border-t border-border py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
                  <Moon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-serif text-lg text-gold">Dream Companion</p>
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
                © {new Date().getFullYear()} Dream Companion. 
                AI is a tool, not the interpreter. All interpretations sourced from classical scholars.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
