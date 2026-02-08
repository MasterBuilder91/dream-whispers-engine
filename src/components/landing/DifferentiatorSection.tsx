import { XCircle, CheckCircle, AlertTriangle, BookOpen, Cpu, Quote, Eye, Link2 } from "lucide-react";

export function DifferentiatorSection() {
  return (
    <section className="py-12 sm:py-20" id="why-different">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-gold mb-4">
            The Hallucination Problem
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Most "Islamic AI" apps fabricate interpretations. We don't.
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
                <p className="text-sm text-muted-foreground">The uncomfortable truth</p>
              </div>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-destructive">Pure hallucination</strong> — AI summarizes "what it thinks scholars say" without reading actual texts
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-destructive">No verifiable sources</strong> — ask them to show you the original passage. They can't.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-destructive">Trained on random internet content</strong> — forums, blogs, and user-generated content mixed with (maybe) some authentic material
                </span>
              </li>
              <li className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-destructive">Impossible to audit</strong> — is this interpretation from Ibn Sirin or a Reddit post? You'll never know.
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
                <p className="text-sm text-muted-foreground">Verifiable. Auditable. Authentic.</p>
              </div>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Link2 className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-gold">Every interpretation linked to source</strong> — see the exact book, chapter, and passage used
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-gold">Fully auditable</strong> — we show you the classical text. You decide if the interpretation is accurate.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-gold">839 Ibn Sirin + 4,254 Al-Nabulsi entries</strong> — complete scholarly works, not internet summaries
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-foreground/80">
                  <strong className="text-gold">No sources = we tell you</strong> — if we can't find relevant texts, we're transparent about it
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
            Let's be crystal clear: AI is merely a <strong>retrieval tool</strong> — like a search engine for classical texts. 
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
