
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
    // Debug log
    console.log('App mounted, setting up message listener');
    
    // Nasłuchiwanie wiadomości z FiveM
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data);
      const data = event.data;
      
      switch(data.type) {
        case 'showReportMenu':
          console.log('Showing report menu with player data:', data.playerData);
          setPlayerData(data.playerData);
          setCurrentView('report');
          setIsVisible(true);
          break;
        case 'showAdminMenu':
          console.log('Showing admin menu');
          setCurrentView('admin');
          setIsVisible(true);
          break;
        case 'hideUI':
          console.log('Hiding UI');
          setIsVisible(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Test w przeglądarce - symulacja FiveM
    if (typeof window.GetParentResourceName === 'undefined') {
      console.log('Not in FiveM environment, enabling test mode');
      // Symuluj otworzenie menu po 2 sekundach dla testów
      setTimeout(() => {
        setPlayerData({ id: 1, name: "TestPlayer" });
        setCurrentView('report');
        setIsVisible(true);
      }, 2000);
    }
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Funkcja do zamykania UI i komunikacji z FiveM
  const closeUI = () => {
    console.log('Closing UI');
    setIsVisible(false);
    // Wyślij wiadomość do FiveM że UI zostało zamknięte
    if (window.GetParentResourceName) {
      fetch(`https://${window.GetParentResourceName()}/closeUI`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).catch((error) => {
        console.error('Error closing UI:', error);
      });
    }
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

  console.log('App render - isVisible:', isVisible, 'currentView:', currentView);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeUI} />
            <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden z-10">
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
