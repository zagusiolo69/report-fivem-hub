import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  MessageCircle,
  User,
  Calendar,
  Eye,
  Users,
  TrendingUp,
  Shield
} from "lucide-react";
import { Report, ReportStats } from "@/types/report";
import { ReportDetails } from "./ReportDetails";

interface AdminDashboardProps {
  reports: Report[];
  onUpdateReport: (reportId: string, updates: Partial<Report>) => void;
}

export function AdminDashboard({ reports, onUpdateReport }: AdminDashboardProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const stats: ReportStats = {
    total: reports.length,
    open: reports.filter(r => r.status === 'open').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    closed: reports.filter(r => r.status === 'closed').length,
    urgent: reports.filter(r => r.priority === 'urgent').length
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning text-warning-foreground';
      case 'in-progress': return 'bg-primary text-primary-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-danger text-danger-foreground';
      case 'urgent': return 'bg-danger text-danger-foreground animate-pulse-glow';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return <AlertTriangle className="w-4 h-4" />;
      case 'player': return <User className="w-4 h-4" />;
      case 'cheating': return <Shield className="w-4 h-4" />;
      case 'griefing': return <Users className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (selectedReport) {
    return (
      <ReportDetails
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
        onUpdate={(updates) => {
          onUpdateReport(selectedReport.id, updates);
          setSelectedReport({ ...selectedReport, ...updates });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Panel Administracyjny - Zgłoszenia
          </h1>
          <p className="text-muted-foreground">Zarządzaj zgłoszeniami graczy i monitoruj serwer</p>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="hover:shadow-glow transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Wszystkie</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-glow transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{stats.open}</div>
              <div className="text-sm text-muted-foreground">Otwarte</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-glow transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">W trakcie</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-glow transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.resolved}</div>
              <div className="text-sm text-muted-foreground">Rozwiązane</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-glow transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.closed}</div>
              <div className="text-sm text-muted-foreground">Zamknięte</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-danger transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-danger animate-pulse">{stats.urgent}</div>
              <div className="text-sm text-muted-foreground">Pilne</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtry */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Szukaj zgłoszeń..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">Wszystkie statusy</option>
                  <option value="open">Otwarte</option>
                  <option value="in-progress">W trakcie</option>
                  <option value="resolved">Rozwiązane</option>
                  <option value="closed">Zamknięte</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">Wszystkie kategorie</option>
                  <option value="bug">Bug</option>
                  <option value="player">Gracz</option>
                  <option value="cheating">Cheating</option>
                  <option value="griefing">Griefing</option>
                  <option value="other">Inne</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista zgłoszeń */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Brak zgłoszeń</h3>
                <p className="text-muted-foreground">Nie znaleziono zgłoszeń spełniających kryteria wyszukiwania.</p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-glow transition-all cursor-pointer" onClick={() => setSelectedReport(report)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(report.category)}
                          <h3 className="font-semibold text-lg">{report.title}</h3>
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status === 'open' && 'Otwarte'}
                          {report.status === 'in-progress' && 'W trakcie'}
                          {report.status === 'resolved' && 'Rozwiązane'}
                          {report.status === 'closed' && 'Zamknięte'}
                        </Badge>
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority === 'low' && 'Niska'}
                          {report.priority === 'medium' && 'Średnia'}
                          {report.priority === 'high' && 'Wysoka'}
                          {report.priority === 'urgent' && 'Pilna'}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">{report.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {report.playerName} (ID: {report.playerId})
                        </div>
                        {report.reportedPlayerName && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            vs {report.reportedPlayerName}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(report.createdAt).toLocaleDateString('pl-PL')}
                        </div>
                        {report.chatMessages.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {report.chatMessages.length} wiadomości
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="ml-4">
                      <Eye className="w-4 h-4 mr-1" />
                      Zobacz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}