import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Install from "./pages/Install";
import Dictionary from "./pages/Dictionary";
import DictionaryEntry from "./pages/DictionaryEntry";
import ImportData from "./pages/ImportData";
import AdminIngest from "./pages/AdminIngest";
import Support from "./pages/Support";
import Auth from "./pages/Auth";
import Journal from "./pages/Journal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/install" element={<Install />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/dictionary/:slug" element={<DictionaryEntry />} />
              <Route path="/support" element={<Support />} />
              <Route path="/pricing" element={<Support />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/journal" element={<Journal />} />


              <Route path="/import" element={<ImportData />} />
              <Route path="/admin/ingest" element={<AdminIngest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
