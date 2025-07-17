export interface Report {
  id: string;
  playerId: string;
  playerName: string;
  reportedPlayerId?: string;
  reportedPlayerName?: string;
  category: 'bug' | 'player' | 'cheating' | 'griefing' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  attachments: string[];
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  assignedAdmin?: string;
  adminNotes: string;
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  reportId: string;
  senderId: string;
  senderName: string;
  senderType: 'player' | 'admin';
  message: string;
  timestamp: Date;
}

export interface ReportStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
}