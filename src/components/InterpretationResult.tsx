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
    <div className="w-full max-w-3xl mx-auto mt-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="dream-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/10 to-accent/10 px-6 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <Book className="w-4 h-4 text-gold" />
              </div>
              <h3 className="text-lg font-serif text-gradient-gold">التفسير / Interpretation</h3>
            </div>
            
            {sourcesUsed > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-gold/70" />
                <span>{sourcesUsed} references</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="p-6 md:p-8 max-h-[600px] overflow-y-auto scrollbar-thin"
        >
          {isStreaming && !interpretation && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              <span>Analyzing your dream using classical texts...</span>
            </div>
          )}
          
          <div className="prose prose-invert prose-gold max-w-none" dir="auto">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-serif text-gradient-gold mb-4 mt-6 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-serif text-gold mb-3 mt-5">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-serif text-gold/90 mb-2 mt-4">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-foreground/90 leading-relaxed mb-4 text-base">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/85">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground/85">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-foreground/85">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="text-gold font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-gold-light italic">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-r-4 border-gold/50 pr-4 my-4 italic text-foreground/80 bg-gold/5 py-2 rounded-l">
                    {children}
                  </blockquote>
                ),
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
        <div className="px-6 py-4 border-t border-border/50 bg-secondary/20">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
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
