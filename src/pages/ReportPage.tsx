import { useState } from "react";
import { ReportForm } from "@/components/ReportForm";
import { Report } from "@/types/report";

export default function ReportPage() {
  const handleSubmitReport = (reportData: Report) => {
    // Wyślij webhook do Discord
    const webhookUrl = "YOUR_DISCORD_WEBHOOK_URL";
    
    const discordMessage = {
      embeds: [{
        title: `🚨 Nowe Zgłoszenie #${reportData.id.slice(-6)}`,
        description: `**${reportData.title}**\n\n${reportData.description}`,
        color: reportData.priority === 'urgent' ? 0xff0000 : 0x7c3aed,
        fields: [
          { name: "Zgłaszający", value: `${reportData.playerName} (ID: ${reportData.playerId})`, inline: true },
          { name: "Kategoria", value: reportData.category, inline: true },
          { name: "Priorytet", value: reportData.priority, inline: true },
        ],
        timestamp: new Date().toISOString()
      }]
    };

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    }).catch(console.error);

    // Zapisz do localStorage (w prawdziwej implementacji - do bazy danych)
    const savedReports = JSON.parse(localStorage.getItem('reports') || '[]');
    savedReports.push(reportData);
    localStorage.setItem('reports', JSON.stringify(savedReports));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Utwórz Zgłoszenie</h1>
        <p className="text-muted-foreground mb-6">Opisz szczegółowo swój problem abyśmy mogli Ci pomóc</p>
      </div>
      <ReportForm onSubmit={handleSubmitReport} />
    </div>
  );
}