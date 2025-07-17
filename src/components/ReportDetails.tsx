import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle,
  User,
  Calendar,
  Paperclip,
  AlertTriangle,
  Shield,
  Users,
  HelpCircle,
  Image as ImageIcon
} from "lucide-react";
import { Report, ChatMessage } from "@/types/report";
import { useToast } from "@/hooks/use-toast";

interface ReportDetailsProps {
  report: Report;
  onBack: () => void;
  onUpdate: (updates: Partial<Report>) => void;
}

export function ReportDetails({ report, onBack, onUpdate }: ReportDetailsProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [adminNotes, setAdminNotes] = useState(report.adminNotes);
  const [showImageModal, setShowImageModal] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      reportId: report.id,
      senderId: "admin_123", // zastąpić ID aktualnego admina
      senderName: "Admin", // zastąpić nazwą admina
      senderType: "admin",
      message: message.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...report.chatMessages, newMessage];
    onUpdate({ chatMessages: updatedMessages });
    setMessage("");
    
    toast({
      description: "Wiadomość została wysłana",
    });
  };

  const handleStatusChange = (status: 'open' | 'in-progress' | 'resolved' | 'closed') => {
    onUpdate({ status, updatedAt: new Date() });
    
    toast({
      title: "Status zaktualizowany",
      description: `Zgłoszenie oznaczone jako: ${
        status === 'open' ? 'Otwarte' :
        status === 'in-progress' ? 'W trakcie' :
        status === 'resolved' ? 'Rozwiązane' :
        'Zamknięte'
      }`,
    });
  };

  const handleSaveNotes = () => {
    onUpdate({ adminNotes });
    
    toast({
      description: "Notatki zostały zapisane",
    });
  };

  const getCategoryData = (category: string) => {
    switch (category) {
      case 'bug': return { icon: AlertTriangle, label: "Bug/Błąd", color: "bg-warning" };
      case 'player': return { icon: User, label: "Zgłoszenie gracza", color: "bg-danger" };
      case 'cheating': return { icon: Shield, label: "Cheating", color: "bg-danger" };
      case 'griefing': return { icon: Users, label: "Griefing", color: "bg-warning" };
      default: return { icon: HelpCircle, label: "Inne", color: "bg-muted" };
    }
  };

  const getPriorityData = (priority: string) => {
    switch (priority) {
      case 'low': return { label: "Niska", color: "bg-success" };
      case 'medium': return { label: "Średnia", color: "bg-warning" };
      case 'high': return { label: "Wysoka", color: "bg-danger" };
      case 'urgent': return { label: "Pilna", color: "bg-danger animate-pulse-glow" };
      default: return { label: "Nieznany", color: "bg-muted" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning text-warning-foreground';
      case 'in-progress': return 'bg-primary text-primary-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const categoryData = getCategoryData(report.category);
  const CategoryIcon = categoryData.icon;
  const priorityData = getPriorityData(report.priority);

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Nagłówek z przyciskiem powrotu */}
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Zgłoszenie #{report.id.slice(-6)}
          </h1>
        </div>

        {/* Główne informacje o zgłoszeniu */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <CategoryIcon className="w-5 h-5 text-primary" />
                {report.title}
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(report.status)}>
                  {report.status === 'open' && 'Otwarte'}
                  {report.status === 'in-progress' && 'W trakcie'}
                  {report.status === 'resolved' && 'Rozwiązane'}
                  {report.status === 'closed' && 'Zamknięte'}
                </Badge>
                <Badge className={priorityData.color}>
                  {priorityData.label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Zgłaszający:</p>
                <p className="font-medium">{report.playerName} (ID: {report.playerId})</p>
              </div>
              {report.reportedPlayerName && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Zgłoszony gracz:</p>
                  <p className="font-medium">{report.reportedPlayerName} (ID: {report.reportedPlayerId})</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Data zgłoszenia:</p>
                <p className="font-medium">{new Date(report.createdAt).toLocaleString('pl-PL')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ostatnia aktualizacja:</p>
                <p className="font-medium">{new Date(report.updatedAt).toLocaleString('pl-PL')}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Opis zgłoszenia:</p>
              <div className="bg-muted/30 p-3 rounded-md whitespace-pre-wrap">
                {report.description}
              </div>
            </div>

            {report.attachments && report.attachments.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Załączniki:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {report.attachments.map((attachment, index) => (
                    <div 
                      key={index} 
                      className="relative cursor-pointer hover:opacity-90 transition-all"
                      onClick={() => setShowImageModal(attachment)}
                    >
                      <img 
                        src={attachment} 
                        alt={`Załącznik ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <div className="absolute bottom-0 right-0 m-1">
                        <Badge variant="secondary" className="p-1">
                          <ImageIcon className="w-3 h-3" />
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-6">
              <Button
                variant={report.status === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('open')}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Otwarte
              </Button>
              <Button
                variant={report.status === 'in-progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('in-progress')}
              >
                <Clock className="w-4 h-4 mr-2" />
                W trakcie
              </Button>
              <Button
                variant={report.status === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('resolved')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Rozwiązane
              </Button>
              <Button
                variant={report.status === 'closed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('closed')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Zamknięte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sekcja z notatkami admina */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Notatki Administratora</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Dodaj wewnętrzne notatki widoczne tylko dla administracji..."
              rows={4}
            />
            <Button onClick={handleSaveNotes} className="mt-3">
              Zapisz notatki
            </Button>
          </CardContent>
        </Card>

        {/* Sekcja chatu */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Komunikacja z graczem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 mb-4 max-h-[400px] overflow-y-auto p-2">
              {report.chatMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Brak wiadomości. Rozpocznij konwersację z graczem.</p>
                </div>
              ) : (
                report.chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderType === 'admin' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg ${
                        msg.senderType === 'admin'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {msg.senderType === 'admin' ? 'Admin' : msg.senderName}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString('pl-PL')}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Napisz wiadomość do gracza..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Wyślij
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal do powiększania obrazka */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={showImageModal}
              alt="Powiększony załącznik"
              className="max-w-full max-h-full object-contain"
            />
            <Button 
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => setShowImageModal(null)}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}