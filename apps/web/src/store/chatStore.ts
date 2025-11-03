import { create } from 'zustand';
import type { ChatMessage } from '@/lib/types';

type ChatState = {
  messages: ChatMessage[];
  isLoading: boolean;
  isMobileMenuOpen: boolean;
  addMessage: (message: ChatMessage) => void;
  toggleMobileMenu: () => void;
  setLoading: (loading: boolean) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  isMobileMenuOpen: false,
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  setLoading: (loading) => set({ isLoading: loading }),
}));


