
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import ReportPage from "./pages/ReportPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";

const queryClient = new QueryClient();

const App = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'report' | 'admin'>('home');
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
        case 'showHomeMenu':
          console.log('Showing home menu');
          setCurrentView('home');
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
      // Pokaż stronę główną domyślnie
      setCurrentView('home');
      setIsVisible(true);
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

  const handleOpenReport = () => {
    setCurrentView('report');
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  // Obsługa ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (currentView === 'home') {
          closeUI();
        } else {
          handleBackToHome();
        }
      }
    };

    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentView]);

  console.log('App render - isVisible:', isVisible, 'currentView:', currentView);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isVisible && (
          <div className="fixed inset-0 z-50">
            {currentView === 'home' && (
              <>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeUI} />
                <div className="relative h-full overflow-auto">
                  <HomePage onOpenReport={handleOpenReport} onOpenAdmin={handleOpenAdmin} />
                </div>
              </>
            )}
            {currentView !== 'home' && (
              <>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleBackToHome} />
                <div className="relative flex items-center justify-center h-full p-4">
                  <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden z-10">
                    {currentView === 'report' && <ReportPage onClose={handleBackToHome} playerData={playerData} />}
                    {currentView === 'admin' && <AdminPage onClose={handleBackToHome} />}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
