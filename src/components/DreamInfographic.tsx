import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DreamInfographicProps {
  imageUrl: string | null;
  isGenerating: boolean;
}

export function DreamInfographic({ imageUrl, isGenerating }: DreamInfographicProps) {
  if (!isGenerating && !imageUrl) return null;

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `dream-interpretation-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 fade-in-up" style={{ animationDelay: "0.4s" }}>
      <div className="dream-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/10 to-accent/10 px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
              </div>
              <h3 className="text-base sm:text-lg font-serif text-gradient-gold">
                Dream Symbols Infographic
              </h3>
            </div>
            {imageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="border-gold/30 hover:bg-gold/10"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
          {isGenerating && !imageUrl ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              <span className="text-sm">Generating dream symbols infographic...</span>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Dream interpretation infographic showing key symbols"
              className="w-full rounded-lg"
              loading="lazy"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
