import { useState, useEffect } from "react";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Report } from "@/types/report";

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    // Wczytaj zgłoszenia z localStorage
    const savedReports = JSON.parse(localStorage.getItem('reports') || '[]');
    setReports(savedReports);
  }, []);

  const handleUpdateReport = (reportId: string, updates: Partial<Report>) => {
    const updatedReports = reports.map(report => 
      report.id === reportId ? { ...report, ...updates } : report
    );
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
  };

  return <AdminDashboard reports={reports} onUpdateReport={handleUpdateReport} />;
}