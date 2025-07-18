import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import ReportPage from "./pages/ReportPage";
import AdminPage from "./pages/AdminPage";

const queryClient = new QueryClient();

const App = () => {
  const [currentView, setCurrentView] = useState<'home' | 'report' | 'admin'>('home');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background">
          {currentView === 'home' && (
            <div className="container mx-auto px-4 py-8 text-center space-y-6">
              <h1 className="text-4xl font-bold text-foreground">FiveM Report System</h1>
              <p className="text-muted-foreground">System działa w tle. Użyj komendy /report w grze.</p>
            </div>
          )}
          {currentView === 'report' && <ReportPage />}
          {currentView === 'admin' && <AdminPage />}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
