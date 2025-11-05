export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  businessName: string;
  businessDescription: string;
  hasCompletedOnboarding: boolean;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'bot';
  content: string;
  sources?: { title: string }[];
  createdAt?: Date;
};

export type Conversation = {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationWithPreview = Conversation & {
  lastMessage?: string;
  lastMessageAt?: Date;
};


