import { Moon, Stars, BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="relative pt-12 pb-8 md:pt-16 md:pb-12 text-center">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-star rounded-full animate-glow-pulse opacity-40" />
        <div className="absolute top-32 right-20 w-1.5 h-1.5 bg-star rounded-full animate-glow-pulse opacity-30" style={{ animationDelay: '1s' }} />
        <div className="absolute top-16 right-1/3 w-1 h-1 bg-star rounded-full animate-glow-pulse opacity-50" style={{ animationDelay: '2s' }} />
      </div>

      {/* Logo and title */}
      <div className="relative z-10 fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg shadow-gold/30 pulse-glow">
              <Moon className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <Stars className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gradient-gold mb-4 tracking-tight">
          تفسير الأحلام
        </h1>
        
        <p className="text-lg md:text-xl text-foreground/80 mb-2 font-serif">
          Dream Interpretation Engine
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>Based on Ibn Sirin & Al-Nabulsi</span>
        </div>
      </div>

      {/* Subtle divider */}
      <div className="mt-8 flex justify-center">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>
    </header>
  );
}
