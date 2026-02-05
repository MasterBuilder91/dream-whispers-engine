import { XCircle, CheckCircle, AlertTriangle, BookOpen, Cpu, Quote } from "lucide-react";

export function DifferentiatorSection() {
  return (
    <section className="py-12 sm:py-20" id="why-different">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-gold mb-4">
            Why Every Other Tool Falls Short
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            The uncomfortable truth about "Islamic dream interpretation" apps
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {/* Others */}
          <div className="dream-card rounded-2xl p-6 sm:p-8 border-destructive/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif text-destructive">Other "Islamic AI" Tools</h3>
                <p className="text-sm text-muted-foreground">What they don't tell you</p>
              </div>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-destructive">AI makes up interpretations</strong> — trained on random internet content, not scholarly texts
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-destructive">No source citations</strong> — you have no way to verify if interpretations are authentic
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-destructive">Gatekeeping knowledge</strong> — hiding behind paywalls for fabricated content
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-destructive">Mix of authentic & fabricated</strong> — impossible to distinguish what's real
                </span>
              </li>
            </ul>
          </div>

          {/* Ours */}
          <div className="dream-card rounded-2xl p-6 sm:p-8 glow-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-serif text-gold">Dream Whispers Engine</h3>
                <p className="text-sm text-muted-foreground">The authentic approach</p>
              </div>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-gold">Primary sources ONLY</strong> — directly from Ibn Sirin & Al-Nabulsi's original texts
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-gold">Every interpretation cited</strong> — see the exact source, scholar, and passage
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-gold">No gatekeeping</strong> — free access to the knowledge that belongs to everyone
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-gold">AI as a tool, not interpreter</strong> — technology serves the text, not replaces it
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* The key insight */}
        <div className="dream-card rounded-2xl p-6 sm:p-10 text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-4">
              <Cpu className="w-8 h-8 text-muted-foreground" />
              <span className="text-2xl text-muted-foreground">≠</span>
              <BookOpen className="w-8 h-8 text-gold" />
            </div>
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-serif text-foreground mb-4">
            AI Is <span className="text-gold">Not</span> The Interpreter
          </h3>
          
          <p className="text-lg text-foreground/70 mb-6 max-w-2xl mx-auto">
            Let's be crystal clear: AI is merely a <strong>technological tool</strong> — like a search engine for classical texts. 
            The actual interpretations come from <strong className="text-gold">Ibn Sirin</strong> and <strong className="text-gold">Al-Nabulsi</strong>, 
            scholars who dedicated their lives to this sacred science.
          </p>
          
          <div className="border-t border-border pt-6">
            <Quote className="w-8 h-8 text-gold/50 mx-auto mb-3" />
            <blockquote className="text-lg sm:text-xl font-serif italic text-foreground/80 arabic-text" dir="rtl">
              "الرؤيا جزء من ستة وأربعين جزءاً من النبوة"
            </blockquote>
            <p className="text-sm text-muted-foreground mt-2">
              "Dreams are one forty-sixth part of prophecy" — Sahih Bukhari
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
