import { Megaphone } from "lucide-react";

interface AdBannerProps {
  position: "top" | "middle" | "bottom";
  className?: string;
}

export function AdBanner({ position, className = "" }: AdBannerProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="dream-card rounded-xl border border-dashed border-gold/30 bg-secondary/20">
        <div className="flex items-center justify-center gap-3 py-8 sm:py-12 px-4">
          <Megaphone className="w-5 h-5 text-gold/50" />
          <div className="text-center">
            <p className="text-sm text-gold/70 font-medium">ADVERTISEMENT SPACE</p>
            <p className="text-xs text-muted-foreground mt-1">
              {position === "top" && "Premium Banner Position • 728x90"}
              {position === "middle" && "In-Content Placement • 336x280"}
              {position === "bottom" && "Footer Banner • 728x90"}
            </p>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground/50 mt-2">
        <a href="#advertise" className="hover:text-gold transition-colors">
          Interested in advertising? →
        </a>
      </p>
    </div>
  );
}
