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
};


