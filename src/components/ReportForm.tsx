import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, AlertTriangle, User, Bug, Shield, Users, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportFormProps {
  onSubmit: (reportData: any) => void;
  onCancel?: () => void;
}

export function ReportForm({ onSubmit, onCancel }: ReportFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    playerId: "",
    playerName: "",
    reportedPlayerId: "",
    reportedPlayerName: "",
    category: "",
    priority: "medium",
    title: "",
    description: "",
    attachments: [] as string[]
  });

  const categories = [
    { value: "bug", label: "Bug/Błąd", icon: Bug, color: "bg-warning" },
    { value: "player", label: "Zgłoszenie gracza", icon: User, color: "bg-danger" },
    { value: "cheating", label: "Cheating", icon: Shield, color: "bg-danger" },
    { value: "griefing", label: "Griefing", icon: Users, color: "bg-warning" },
    { value: "other", label: "Inne", icon: HelpCircle, color: "bg-muted" }
  ];

  const priorities = [
    { value: "low", label: "Niska", color: "bg-success" },
    { value: "medium", label: "Średnia", color: "bg-warning" },
    { value: "high", label: "Wysoka", color: "bg-danger" },
    { value: "urgent", label: "Pilna", color: "bg-danger animate-pulse-glow" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.playerId || !formData.playerName || !formData.category || !formData.title || !formData.description) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie wymagane pola",
        variant: "destructive"
      });
      return;
    }

    const reportData = {
      ...formData,
      id: `report_${Date.now()}`,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
      adminNotes: "",
      chatMessages: []
    };

    onSubmit(reportData);
    
    toast({
      title: "Zgłoszenie wysłane!",
      description: "Twoje zgłoszenie zostało przesłane do administracji",
      variant: "default"
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Symulacja uploadu plików
      const newAttachments = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const selectedPriority = priorities.find(pri => pri.value === formData.priority);

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2 justify-center">
          <AlertTriangle className="text-primary" />
          Nowe Zgłoszenie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dane gracza zgłaszającego */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="playerId">ID Gracza *</Label>
              <Input
                id="playerId"
                value={formData.playerId}
                onChange={(e) => setFormData(prev => ({ ...prev, playerId: e.target.value }))}
                placeholder="123"
                required
              />
            </div>
            <div>
              <Label htmlFor="playerName">Nick Gracza *</Label>
              <Input
                id="playerName"
                value={formData.playerName}
                onChange={(e) => setFormData(prev => ({ ...prev, playerName: e.target.value }))}
                placeholder="TwojNick"
                required
              />
            </div>
          </div>

          {/* Dane zgłaszanego gracza (opcjonalne) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportedPlayerId">ID Zgłaszanego Gracza</Label>
              <Input
                id="reportedPlayerId"
                value={formData.reportedPlayerId}
                onChange={(e) => setFormData(prev => ({ ...prev, reportedPlayerId: e.target.value }))}
                placeholder="456"
              />
            </div>
            <div>
              <Label htmlFor="reportedPlayerName">Nick Zgłaszanego</Label>
              <Input
                id="reportedPlayerName"
                value={formData.reportedPlayerName}
                onChange={(e) => setFormData(prev => ({ ...prev, reportedPlayerName: e.target.value }))}
                placeholder="NickGracza"
              />
            </div>
          </div>

          {/* Kategoria i priorytet */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Kategoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <Badge className={`mt-2 ${selectedCategory.color} text-white`}>
                  <selectedCategory.icon className="w-3 h-3 mr-1" />
                  {selectedCategory.label}
                </Badge>
              )}
            </div>
            <div>
              <Label>Priorytet</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPriority && (
                <Badge className={`mt-2 ${selectedPriority.color} text-white`}>
                  {selectedPriority.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Tytuł */}
          <div>
            <Label htmlFor="title">Tytuł zgłoszenia *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Krótki opis problemu"
              required
            />
          </div>

          {/* Opis */}
          <div>
            <Label htmlFor="description">Szczegółowy opis *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Opisz szczegółowo co się stało, gdzie, kiedy..."
              rows={5}
              required
            />
          </div>

          {/* Upload plików */}
          <div>
            <Label>Załączniki (screenshoty, zdjęcia)</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Kliknij aby dodać pliki lub przeciągnij tutaj</p>
              </label>
            </div>
            
            {formData.attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {formData.attachments.map((attachment, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={attachment} 
                      alt={`Załącznik ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Przyciski */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-primary hover:shadow-glow">
              Wyślij Zgłoszenie
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}