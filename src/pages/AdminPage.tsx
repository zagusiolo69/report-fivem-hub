
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Report } from "@/types/report";

interface AdminPageProps {
  onClose: () => void;
}

const AdminPage = ({ onClose }: AdminPageProps) => {
  const [reports, setReports] = useState<Report[]>([]);

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

  const handleUpdateReport = (reportId: string, updates: Partial<Report>) => {
    // Update local state
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId ? { ...report, ...updates } : report
      )
    );

    // Send update to FiveM
    if (window.GetParentResourceName) {
      fetch(`https://${window.GetParentResourceName()}/updateReport`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          updates
        })
      });
    }
  };

  return (
    <Card className="w-full h-full max-h-[90vh]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Panel administratora</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="h-full overflow-hidden">
        <AdminDashboard reports={reports} onUpdateReport={handleUpdateReport} />
      </CardContent>
    </Card>
  );
};

export default AdminPage;
