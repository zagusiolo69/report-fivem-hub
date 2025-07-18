
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import ReportPage from "./pages/ReportPage";
import AdminPage from "./pages/AdminPage";

const queryClient = new QueryClient();

const App = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState<'report' | 'admin'>('report');
  const [playerData, setPlayerData] = useState({ id: 0, name: "Gracz" });

  useEffect(() => {
    // Nasłuchiwanie wiadomości z FiveM
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      
      switch(data.type) {
        case 'showReportMenu':
          setPlayerData(data.playerData);
          setCurrentView('report');
          setIsVisible(true);
          break;
        case 'showAdminMenu':
          setCurrentView('admin');
          setIsVisible(true);
          break;
        case 'hideUI':
          setIsVisible(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Funkcja do zamykania UI i komunikacji z FiveM
  const closeUI = () => {
    setIsVisible(false);
    // Wyślij wiadomość do FiveM że UI zostało zamknięte
    fetch(`https://${window.GetParentResourceName?.() || 'fivem_report_system'}/closeUI`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }).catch(() => {});
  };

  // Obsługa ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeUI();
      }
    };

    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isVisible && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {currentView === 'report' && <ReportPage onClose={closeUI} playerData={playerData} />}
              {currentView === 'admin' && <AdminPage onClose={closeUI} />}
            </div>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
