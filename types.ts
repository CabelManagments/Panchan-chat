
export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: 'online' | 'offline' | 'away';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  roomId: string;
  type: 'text' | 'system' | 'ai';
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  description: string;
  lastMessage?: string;
}

export type AppState = 'setup' | 'chat';
