import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Moon, Stars, Download, Check, Smartphone, Share, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";


interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen starfield geometric-pattern flex items-center justify-center p-4">
      <Helmet>
        <title>Install BinSirin — Islamic Dream Interpretation App</title>
        <meta name="description" content="Install BinSirin on iPhone or Android for quick access to authentic Islamic dream interpretation from Ibn Sirin and Al-Nabulsi." />
        <link rel="canonical" href="https://binsirin.com/install" />
        <meta property="og:title" content="Install BinSirin — Islamic Dream Interpretation App" />
        <meta property="og:description" content="Add BinSirin to your home screen for offline access to authentic Islamic dream interpretation." />
        <meta property="og:url" content="https://binsirin.com/install" />
      </Helmet>
      <main className="relative z-10 w-full max-w-md text-center">
        {/* Logo */}
        <div className="fade-in-up mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg shadow-gold/30 pulse-glow">
                <Moon className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                <Stars className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-serif text-gradient-gold mb-2">Install BinSirin — Islamic Dream Interpretation</h1>
          <p className="text-muted-foreground">رفيق الأحلام</p>
        </div>


        {/* Install Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 fade-in-up" style={{ animationDelay: "0.1s" }}>
          {isInstalled ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Already Installed!</h2>
              <p className="text-muted-foreground mb-6">
                BinSirin is installed on your device. Open it from your home screen.
              </p>
              <a href="/">
                <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground">
                  Open App
                </Button>
              </a>
            </div>
          ) : isIOS ? (
            <div className="text-center">
              <Smartphone className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Install on iPhone</h2>
              <p className="text-muted-foreground mb-6">
                Add BinSirin to your home screen for the best experience:
              </p>
              
              <div className="text-left space-y-4 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <Share className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">1. Tap the Share button</p>
                    <p className="text-xs text-muted-foreground">At the bottom of Safari</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">2. Tap "Add to Home Screen"</p>
                    <p className="text-xs text-muted-foreground">Scroll down in the share menu</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">3. Tap "Add"</p>
                    <p className="text-xs text-muted-foreground">Confirm to install</p>
                  </div>
                </div>
              </div>
            </div>
          ) : deferredPrompt ? (
            <div className="text-center">
              <Download className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Install BinSirin</h2>
              <p className="text-muted-foreground mb-6">
                Add to your home screen for quick access, offline support, and a native app experience.
              </p>
              <Button
                onClick={handleInstall}
                className="bg-gradient-gold hover:opacity-90 text-primary-foreground font-semibold px-8 py-5"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Smartphone className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Install on Android</h2>
              <p className="text-muted-foreground mb-6">
                Add BinSirin to your home screen:
              </p>
              
              <div className="text-left space-y-4 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <MoreVertical className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">1. Tap the menu (⋮)</p>
                    <p className="text-xs text-muted-foreground">Top-right corner of your browser</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">2. Tap "Install app" or "Add to Home screen"</p>
                    <p className="text-xs text-muted-foreground">Option may vary by browser</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="mt-6 fade-in-up" style={{ animationDelay: "0.2s" }}>
          <a href="/" className="text-sm text-muted-foreground hover:text-gold transition-colors">
            ← Continue in browser
          </a>
        </div>
      </main>
    </div>

  );
}
