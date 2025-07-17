import { useState, useEffect } from "react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { Report } from "@/types/report";

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [authError, setAuthError] = useState("");

  // Symulacja listy adminów (w prawdziwej implementacji pobierz z bazy danych)
  const adminCodes = [
    "ADMIN2024", 
    "SUPERADMIN", 
    "MODERATOR123",
    "FIVEM_ADMIN"
  ];

  useEffect(() => {
    // Sprawdź czy admin jest już zalogowany
    const savedAuth = localStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      loadReports();
    }
  }, []);

  const loadReports = () => {
    const savedReports = JSON.parse(localStorage.getItem('reports') || '[]');
    setReports(savedReports);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (adminCodes.includes(adminCode)) {
      setIsAuthenticated(true);
      setAuthError("");
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_code', adminCode);
      loadReports();
    } else {
      setAuthError("Nieprawidłowy kod administratora!");
      setAdminCode("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_code');
  };

  const handleUpdateReport = (reportId: string, updates: Partial<Report>) => {
    const updatedReports = reports.map(report => 
      report.id === reportId ? { ...report, ...updates } : report
    );
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-glow">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Panel Administratora
            </CardTitle>
            <p className="text-muted-foreground">
              Tylko uprawnieni administratorzy mogą uzyskać dostęp
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Kod Administratora
                </label>
                <Input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Wprowadź kod dostępu..."
                  className="bg-background border-primary/30 focus:border-primary"
                  required
                />
              </div>
              
              {authError && (
                <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-danger" />
                  <span className="text-sm text-danger">{authError}</span>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:shadow-glow transition-all"
              >
                <Shield className="w-4 h-4 mr-2" />
                Zaloguj się
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-muted/20 rounded-md">
              <p className="text-xs text-muted-foreground text-center">
                🔒 Dostęp tylko dla uprawnionego personelu<br/>
                Wszystkie próby logowania są monitorowane
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Przycisk wylogowania */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="bg-background/80 backdrop-blur-sm border-primary/30"
        >
          <Lock className="w-4 h-4 mr-2" />
          Wyloguj
        </Button>
      </div>
      
      <AdminDashboard reports={reports} onUpdateReport={handleUpdateReport} />
    </div>
  );
}