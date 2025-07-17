// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
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
      </div>
    </div>
  );
};

export default Index;
