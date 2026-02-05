import { useEffect, useRef } from "react";
import { Book, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface InterpretationResultProps {
  interpretation: string;
  isStreaming: boolean;
  sourcesUsed: number;
}

export function InterpretationResult({ 
  interpretation, 
  isStreaming, 
  sourcesUsed 
}: InterpretationResultProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && isStreaming) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [interpretation, isStreaming]);

  if (!interpretation && !isStreaming) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 sm:mt-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="dream-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/10 to-accent/10 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Book className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
              </div>
              <h3 className="text-base sm:text-lg font-serif text-gradient-gold">التفسير</h3>
            </div>
            
            {sourcesUsed > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/70" />
                <span>{sourcesUsed}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="p-4 sm:p-6 md:p-8 max-h-[60vh] sm:max-h-[600px] overflow-y-auto scrollbar-thin"
        >
          {isStreaming && !interpretation && (
            <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground text-sm sm:text-base">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin flex-shrink-0" />
              <span>Analyzing dream...</span>
            </div>
          )}
          
          <div className="prose prose-invert prose-gold max-w-none prose-sm sm:prose-base">
            <ReactMarkdown
              components={{
                h1: ({ children }) => {
                  const text = String(children);
                  const isArabic = /[\u0600-\u06FF]/.test(text);
                  return (
                    <h1 className="text-2xl font-serif text-gradient-gold mb-4 mt-6 first:mt-0" dir={isArabic ? "rtl" : "ltr"}>
                      {children}
                    </h1>
                  );
                },
                h2: ({ children }) => {
                  const text = String(children);
                  const isArabic = /[\u0600-\u06FF]/.test(text);
                  return (
                    <h2 className="text-xl font-serif text-gold mb-3 mt-5" dir={isArabic ? "rtl" : "ltr"}>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const text = String(children);
                  const isArabic = /[\u0600-\u06FF]/.test(text);
                  return (
                    <h3 className="text-lg font-serif text-gold/90 mb-2 mt-4" dir={isArabic ? "rtl" : "ltr"}>
                      {children}
                    </h3>
                  );
                },
                p: ({ children }) => {
                  const text = String(children);
                  const isArabic = /[\u0600-\u06FF]/.test(text.slice(0, 20));
                  return (
                    <p className="text-foreground/90 leading-relaxed mb-4 text-base" dir={isArabic ? "rtl" : "ltr"} style={{ textAlign: isArabic ? "right" : "left" }}>
                      {children}
                    </p>
                  );
                },
                ul: ({ children }) => (
                  <ul className="space-y-2 mb-4 text-foreground/85 list-disc ltr:ml-4 rtl:mr-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-2 mb-4 text-foreground/85 list-decimal ltr:ml-4 rtl:mr-4">
                    {children}
                  </ol>
                ),
                li: ({ children }) => {
                  const text = String(children);
                  const isArabic = /[\u0600-\u06FF]/.test(text.slice(0, 20));
                  return (
                    <li className="text-foreground/85" dir={isArabic ? "rtl" : "ltr"} style={{ textAlign: isArabic ? "right" : "left" }}>
                      {children}
                    </li>
                  );
                },
                strong: ({ children }) => (
                  <strong className="text-gold font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-gold-light italic">{children}</em>
                ),
                blockquote: ({ children }) => {
                  const text = String(children);
                  const isArabic = /[\u0600-\u06FF]/.test(text.slice(0, 20));
                  return (
                    <blockquote 
                      className={`my-4 italic text-foreground/80 bg-gold/5 py-2 ${isArabic ? "border-r-4 pr-4 rounded-l" : "border-l-4 pl-4 rounded-r"} border-gold/50`}
                      dir={isArabic ? "rtl" : "ltr"}
                    >
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {interpretation}
            </ReactMarkdown>
          </div>

          {isStreaming && interpretation && (
            <span className="inline-block w-2 h-5 bg-gold animate-pulse ml-1" />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/50 bg-secondary/20">
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Ibn Sirin</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Al-Nabulsi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
