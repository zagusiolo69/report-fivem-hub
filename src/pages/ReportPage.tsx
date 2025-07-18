
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Camera, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportPageProps {
  onClose: () => void;
  playerData: { id: number; name: string };
}

const ReportPage = ({ onClose, playerData }: ReportPageProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    reportedPlayerId: "",
    reportedPlayerName: "",
  });
  const [attachments, setAttachments] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const reportData = {
      ...formData,
      attachments,
      playerId: playerData.id,
      playerName: playerData.name,
    };

    try {
      const response = await fetch(`https://${window.GetParentResourceName?.() || 'fivem_report_system'}/submitReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      
      if (response.ok) {
        toast({
          title: "Zgłoszenie wysłane",
          description: "Twoje zgłoszenie zostało pomyślnie wysłane do administracji.",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie.",
        variant: "destructive",
      });
    }
  };

  const takeScreenshot = async () => {
    try {
      await fetch(`https://${window.GetParentResourceName?.() || 'fivem_report_system'}/takeScreenshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zrobić screenshota.",
        variant: "destructive",
      });
    }
  };

  const showPlayerFields = ['player', 'cheating', 'griefing'].includes(formData.category);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Zgłoś problem</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategoria zgłoszenia</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug/Błąd gry</SelectItem>
                  <SelectItem value="player">Zgłoszenie gracza</SelectItem>
                  <SelectItem value="cheating">Cheating/Hacking</SelectItem>
                  <SelectItem value="griefing">Griefing</SelectItem>
                  <SelectItem value="other">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priorytet</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niski</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="high">Wysoki</SelectItem>
                  <SelectItem value="urgent">Pilny</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Tytuł zgłoszenia</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Krótki opis problemu"
              required
            />
          </div>

          {showPlayerFields && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportedPlayerId">ID zgłaszanego gracza</Label>
                <Input
                  id="reportedPlayerId"
                  value={formData.reportedPlayerId}
                  onChange={(e) => setFormData({...formData, reportedPlayerId: e.target.value})}
                  placeholder="Podaj ID gracza"
                />
              </div>
              <div>
                <Label htmlFor="reportedPlayerName">Nick zgłaszanego gracza</Label>
                <Input
                  id="reportedPlayerName"
                  value={formData.reportedPlayerName}
                  onChange={(e) => setFormData({...formData, reportedPlayerName: e.target.value})}
                  placeholder="Podaj nick gracza"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">Szczegółowy opis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Opisz dokładnie co się stało, gdzie, kiedy..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Załączniki</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={takeScreenshot}>
                <Camera className="h-4 w-4 mr-2" />
                Zrób screenshot
              </Button>
            </div>
            {attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {attachments.map((url, index) => (
                  <img key={index} src={url} alt={`Załącznik ${index + 1}`} className="w-full h-20 object-cover rounded" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Wyślij zgłoszenie
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportPage;
