import { Moon, Stars, Sparkles, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStartInterpreting: () => void;
}

export function HeroSection({ onStartInterpreting }: HeroSectionProps) {
  return (
    <section className="relative pt-8 pb-12 sm:pt-16 sm:pb-20 text-center">
      {/* Decorative stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-star rounded-full animate-glow-pulse opacity-40" />
        <div className="absolute top-32 right-20 w-1.5 h-1.5 bg-star rounded-full animate-glow-pulse opacity-30" style={{ animationDelay: '1s' }} />
        <div className="absolute top-16 right-1/3 w-1 h-1 bg-star rounded-full animate-glow-pulse opacity-50" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-star rounded-full animate-glow-pulse opacity-35" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 fade-in-up max-w-5xl mx-auto px-4">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg shadow-gold/30 pulse-glow">
              <Moon className="w-10 h-10 sm:w-14 sm:h-14 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent flex items-center justify-center">
              <Stars className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-gradient-gold mb-4 sm:mb-6 tracking-tight leading-tight">
          تفسير الأحلام
        </h1>
        
        <p className="text-xl sm:text-2xl md:text-3xl text-foreground/90 mb-2 font-serif">
          The First Authentic Dream Engine
        </p>

        {/* Bold differentiator */}
        <div className="my-6 sm:my-8">
          <p className="text-lg sm:text-xl md:text-2xl font-medium text-gold">
            <span className="inline-flex items-center gap-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              NO MORE GATEKEEPING
            </span>
          </p>
          <p className="mt-3 text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto">
            Direct access to <strong className="text-gold">4,000+ primary source interpretations</strong> from Ibn Sirin & Al-Nabulsi. 
            Not another "Islamic AI" that makes things up.
          </p>
        </div>

        {/* Key differentiators */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="px-4 py-2 rounded-full bg-secondary/50 border border-gold/20 text-sm sm:text-base">
            <span className="text-gold">✓</span> Primary Sources Only
          </div>
          <div className="px-4 py-2 rounded-full bg-secondary/50 border border-gold/20 text-sm sm:text-base">
            <span className="text-gold">✓</span> Cited Interpretations
          </div>
          <div className="px-4 py-2 rounded-full bg-secondary/50 border border-gold/20 text-sm sm:text-base">
            <span className="text-gold">✓</span> Scholars Interpret, Not AI
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onStartInterpreting}
          size="lg"
          className="bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold px-8 sm:px-12 py-6 sm:py-7 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gold/30 text-lg sm:text-xl"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Interpret Your Dream Now
        </Button>

        {/* Scholar attribution */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm sm:text-base text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>Powered by Ibn Sirin & Al-Nabulsi's Classical Texts</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-10 sm:mt-14 flex justify-center">
        <div className="h-px w-32 sm:w-48 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>
    </section>
  );
}
