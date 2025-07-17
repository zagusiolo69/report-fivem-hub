// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          System Zgłoszeń FiveM
        </h1>
        <p className="text-xl text-muted-foreground">Webowy panel do zarządzania zgłoszeniami graczy</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="hover:shadow-glow transition-all">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Zgłoś Problem</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Zgłoś bug, problem z graczem lub inne nieprawidłowości na serwerze
            </p>
            <Link to="/report">
              <Button className="w-full bg-gradient-primary hover:shadow-glow">
                <MessageCircle className="w-4 h-4 mr-2" />
                Utwórz Zgłoszenie
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle>Panel Administracyjny</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Zarządzaj zgłoszeniami, komunikuj się z graczami i monitoruj serwer
            </p>
            <Link to="/admin">
              <Button className="w-full bg-gradient-primary hover:shadow-glow">
                <Shield className="w-4 h-4 mr-2" />
                Otwórz Panel
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12 bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Jak zgłosić problem na serwerze?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-lg font-bold">1</span>
            </div>
            <h3 className="text-lg font-medium mb-2">W grze</h3>
            <p className="text-muted-foreground">Użyj komendy <code className="bg-muted px-2 py-1 rounded">/report</code> bezpośrednio w grze</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-lg font-bold">2</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Online</h3>
            <p className="text-muted-foreground">Kliknij przycisk "Utwórz Zgłoszenie" powyżej</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-secondary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-lg font-bold">3</span>
            </div>
            <h3 className="text-lg font-medium mb-2">Discord</h3>
            <p className="text-muted-foreground">Dołącz do naszego serwera Discord i użyj kanału #zgłoszenia</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
