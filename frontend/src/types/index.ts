// Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Bot Types
export interface Bot {
  _id: string;
  name: string;
  ownerId: string;
  apiKey: string;
  avatar?: string;
  description?: string;
  theme: 'light' | 'dark';
  initialPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
  embeddings: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Conversation Types
export interface Conversation {
  id: string;
  botId: string;
  userId: string;
  title?: string;
  messages: Message[];
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    source?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  botId: string;
  sender: 'user' | 'bot';
  content: string;
  tokens: number;
  metadata?: {
    confidence?: number;
    sources?: string[];
  };
  createdAt: Date;
}

// Upload Types
export interface Upload {
  id: string;
  botId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  embeddingCount: number;
  metadata?: {
    pageCount?: number;
    extractedText?: string;
  };
}

// Analytics Types
export interface Analytics {
  totalConversations: number;
  totalMessages: number;
  averageMessagesPerConvo: number;
  weekTrend: TrendData[];
  usageBreakdown: UsageData[];
  responseTimeChart: ResponseTimeData[];
  topMessages: Message[];
}

export interface TrendData {
  date: string;
  conversations: number;
  messages: number;
}

export interface UsageData {
  label: string;
  value: number;
  percentage: number;
}

export interface ResponseTimeData {
  time: string;
  responseTime: number;
}

// Widget Types
export interface WidgetConfig {
  botId: string;
  apiKey: string;
  theme: 'light' | 'dark';
  position: 'bottom-right' | 'bottom-left';
  headerBg: string;
  headerText: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
