
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { AdminDashboard } from "@/components/AdminDashboard";

interface AdminPageProps {
  onClose: () => void;
}

const AdminPage = ({ onClose }: AdminPageProps) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Nasłuchiwanie wiadomości z FiveM
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      
      if (data.type === 'loadReports') {
        setReports(Object.values(data.reports));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <Card className="w-full h-full max-h-[90vh]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Panel administratora</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="h-full overflow-hidden">
        <AdminDashboard reports={reports} />
      </CardContent>
    </Card>
  );
};

export default AdminPage;
