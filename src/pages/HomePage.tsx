
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  Home, 
  Users,
  MessageCircle 
} from "lucide-react";

interface HomePageProps {
  onOpenReport: () => void;
  onOpenAdmin: () => void;
}

const HomePage = ({ onOpenReport, onOpenAdmin }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">FiveM Reports</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Home className="w-4 h-4 mr-2" />
              Strona Główna
            </Button>
            <Button variant="ghost" size="sm" className="text-primary bg-primary/10">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Zgłoś Problem
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Shield className="w-4 h-4 mr-2" />
              Panel Admina
            </Button>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">System Zgłoszeń FiveM</h1>
          <p className="text-muted-foreground text-lg">Webowy panel do zarządzania zgłoszeniami graczy</p>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Report Problem Card */}
          <Card className="hover:shadow-glow transition-all cursor-pointer border-border" onClick={onOpenReport}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Zgłoś Problem</h2>
              <p className="text-muted-foreground mb-6">
                Zgłoś bug, problem z graczem lub inne nieprawidłowości na serwerze
              </p>
              <Button className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Utwórz Zgłoszenie
              </Button>
            </CardContent>
          </Card>

          {/* Admin Panel Card */}
          <Card className="hover:shadow-glow transition-all cursor-pointer border-secondary" onClick={onOpenAdmin}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Panel Administracyjny</h2>
              <p className="text-muted-foreground mb-6">
                Zarządzaj zgłoszeniami, komunikuj się z graczami i monitoruj serwer
              </p>
              <Button variant="outline" className="w-full border-secondary">
                <Shield className="w-4 h-4 mr-2" />
                Otwórz Panel
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* How to Report Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Jak zgłosić problem na serwerze?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">W grze</h3>
                <p className="text-muted-foreground text-sm">
                  Użyj komendy <code className="bg-muted px-2 py-1 rounded text-xs">/report</code> bezpośrednio w grze
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Online</h3>
                <p className="text-muted-foreground text-sm">
                  Kliknij przycisk "Utwórz Zgłoszenie" powyżej
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Discord</h3>
                <p className="text-muted-foreground text-sm">
                  Dołącz do naszego serwera Discord i użyj kanału #zgłoszenia
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
