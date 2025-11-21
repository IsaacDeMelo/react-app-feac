export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  TUTOR = 'TUTOR',
  LOGIN = 'LOGIN'
}

export type ActivityType = 'prova' | 'trabalho' | 'atividade' | 'aviso';

export interface Attachment {
  name: string;
  type: string;
  data: string; // Base64
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string YYYY-MM-DD
  type: ActivityType;
  subject: string;
  createdAt: number;
  attachment?: Attachment;
}

export interface AuthState {
  isAdmin: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  isLoading?: boolean;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface AiConfig {
  context: string;
}