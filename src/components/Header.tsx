import { Moon, Stars, BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="relative pt-8 pb-6 sm:pt-12 sm:pb-8 md:pt-16 md:pb-12 text-center">
      {/* Decorative elements - hidden on small mobile */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block">
        <div className="absolute top-20 left-10 w-2 h-2 bg-star rounded-full animate-glow-pulse opacity-40" />
        <div className="absolute top-32 right-20 w-1.5 h-1.5 bg-star rounded-full animate-glow-pulse opacity-30" style={{ animationDelay: '1s' }} />
        <div className="absolute top-16 right-1/3 w-1 h-1 bg-star rounded-full animate-glow-pulse opacity-50" style={{ animationDelay: '2s' }} />
      </div>

      {/* Logo and title */}
      <div className="relative z-10 fade-in-up">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg shadow-gold/30 pulse-glow">
              <Moon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent flex items-center justify-center">
              <Stars className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-gradient-gold mb-2 sm:mb-4 tracking-tight">
          تفسير الأحلام
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-foreground/80 mb-1 sm:mb-2 font-serif">
          Dream Interpretation
        </p>

        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Ibn Sirin & Al-Nabulsi</span>
        </div>
      </div>

      {/* Subtle divider */}
      <div className="mt-6 sm:mt-8 flex justify-center">
        <div className="h-px w-24 sm:w-32 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>
    </header>
  );
}
