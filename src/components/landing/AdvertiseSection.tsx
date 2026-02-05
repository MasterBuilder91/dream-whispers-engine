import { Megaphone, Users, Globe, TrendingUp, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdvertiseSection() {
  return (
    <section className="py-12 sm:py-20" id="advertise">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center">
              <Megaphone className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gradient-gold mb-4">
            Advertise With Us
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Reach a highly engaged audience seeking authentic Islamic content
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10 sm:mb-14">
          <div className="dream-card rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-gold mx-auto mb-3" />
            <h3 className="text-xl font-serif text-foreground mb-2">Targeted Audience</h3>
            <p className="text-sm text-muted-foreground">
              Muslims seeking authentic Islamic knowledge and guidance
            </p>
          </div>
          
          <div className="dream-card rounded-xl p-6 text-center">
            <Globe className="w-8 h-8 text-gold mx-auto mb-3" />
            <h3 className="text-xl font-serif text-foreground mb-2">Global Reach</h3>
            <p className="text-sm text-muted-foreground">
              Bilingual platform (English & Arabic) reaching worldwide audience
            </p>
          </div>
          
          <div className="dream-card rounded-xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-gold mx-auto mb-3" />
            <h3 className="text-xl font-serif text-foreground mb-2">High Engagement</h3>
            <p className="text-sm text-muted-foreground">
              Users spend quality time engaging with meaningful content
            </p>
          </div>
        </div>

        {/* Ad placement options */}
        <div className="dream-card rounded-2xl p-6 sm:p-8 mb-10">
          <h3 className="text-xl sm:text-2xl font-serif text-gold mb-6 text-center">
            Available Ad Placements
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Premium Banner</span>
                <span className="text-sm text-gold">728×90</span>
              </div>
              <p className="text-sm text-muted-foreground">Top of page, maximum visibility</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">In-Content</span>
                <span className="text-sm text-gold">336×280</span>
              </div>
              <p className="text-sm text-muted-foreground">Between sections, high engagement</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Sidebar</span>
                <span className="text-sm text-gold">300×250</span>
              </div>
              <p className="text-sm text-muted-foreground">Persistent visibility while scrolling</p>
            </div>
            
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Footer Banner</span>
                <span className="text-sm text-gold">728×90</span>
              </div>
              <p className="text-sm text-muted-foreground">End of user journey placement</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Interested in advertising on Dream Whispers Engine?
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-gold hover:opacity-90 text-primary-foreground font-medium px-8 py-6 rounded-xl"
          >
            <a href="mailto:advertise@dreamwhispers.app">
              <Mail className="w-5 h-5 mr-2" />
              Contact for Advertising
            </a>
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            We only accept halal-compliant advertisements
          </p>
        </div>
      </div>
    </section>
  );
}
