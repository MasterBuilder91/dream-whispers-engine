import { BookOpen, Star, Users, FileText } from "lucide-react";

export function SourcesShowcase() {
  return (
    <section className="py-12 sm:py-20 relative" id="sources">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-gold mb-4">
            The Primary Sources
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Two of the most respected dream interpretation texts in Islamic history
          </p>
        </div>

        {/* Scholar cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {/* Ibn Sirin */}
          <div className="dream-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-serif text-primary-foreground">ا</span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif text-gold">Ibn Sirin</h3>
                <p className="text-muted-foreground">محمد بن سيرين</p>
                <p className="text-sm text-muted-foreground mt-1">653–729 CE • Basra, Iraq</p>
              </div>
            </div>
            
            <p className="text-foreground/80 mb-6 leading-relaxed">
              The most famous dream interpreter in Islamic history. His methodology 
              emphasized understanding the dreamer's circumstances and correlating 
              symbols with Quranic and prophetic references. His work remains the 
              foundational text for Islamic dream interpretation.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1.5 rounded-full bg-secondary/50 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold" />
                <span>2,000+ entries</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-secondary/50 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-gold" />
                <span>Tabi'i Scholar</span>
              </div>
            </div>
          </div>

          {/* Al-Nabulsi */}
          <div className="dream-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-serif text-primary-foreground">ن</span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif text-gold">Al-Nabulsi</h3>
                <p className="text-muted-foreground">عبد الغني النابلسي</p>
                <p className="text-sm text-muted-foreground mt-1">1641–1731 CE • Damascus, Syria</p>
              </div>
            </div>
            
            <p className="text-foreground/80 mb-6 leading-relaxed">
              A prolific scholar whose dream interpretation encyclopedia 
              "Ta'tir al-Anam" expanded on Ibn Sirin's work with additional 
              symbols and interpretations. Known for his comprehensive 
              categorization and detailed explanations.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1.5 rounded-full bg-secondary/50 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold" />
                <span>2,500+ entries</span>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-secondary/50 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-gold" />
                <span>Sufi Scholar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="dream-card rounded-xl p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-serif text-gold mb-2">4,000+</div>
            <p className="text-sm text-muted-foreground">Interpretations</p>
          </div>
          <div className="dream-card rounded-xl p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-serif text-gold mb-2">2</div>
            <p className="text-sm text-muted-foreground">Classical Scholars</p>
          </div>
          <div className="dream-card rounded-xl p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-serif text-gold mb-2">1,300</div>
            <p className="text-sm text-muted-foreground">Years of Scholarship</p>
          </div>
          <div className="dream-card rounded-xl p-4 sm:p-6 text-center">
            <div className="text-3xl sm:text-4xl font-serif text-gold mb-2">100%</div>
            <p className="text-sm text-muted-foreground">Cited Sources</p>
          </div>
        </div>
      </div>
    </section>
  );
}
