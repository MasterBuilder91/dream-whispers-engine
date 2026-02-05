import { Header } from "@/components/Header";
import { DreamInput } from "@/components/DreamInput";
import { InterpretationResult } from "@/components/InterpretationResult";
import { useInterpretDream } from "@/hooks/useInterpretDream";

const Index = () => {
  const { interpretation, isLoading, sourcesUsed, interpretDream } = useInterpretDream();

  return (
    <div className="min-h-screen starfield geometric-pattern">
      <div className="relative z-10 container mx-auto px-3 sm:px-4 pb-8 sm:pb-16">
        <Header />
        
        <main className="mt-4 sm:mt-8 md:mt-12">
          <DreamInput onSubmit={interpretDream} isLoading={isLoading} />
          
          <InterpretationResult 
            interpretation={interpretation}
            isStreaming={isLoading}
            sourcesUsed={sourcesUsed}
          />
        </main>

        {/* Footer */}
        <footer className="mt-8 sm:mt-16 text-center">
          <div className="h-px w-full max-w-xs mx-auto bg-gradient-to-r from-transparent via-border to-transparent mb-4 sm:mb-8" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            مبني على كتب تفسير الأحلام الكلاسيكية
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Built with classical dream interpretation texts
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
