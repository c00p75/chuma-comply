import { create } from 'zustand';
import { onSnapshot, query, orderBy, type Unsubscribe } from 'firebase/firestore';
import type { ChatMessage, Conversation } from '@/lib/types';
import {
  createConversation,
  getMessagesCollection,
  getUserConversations,
  addMessageToConversation,
  updateConversationTitle as updateConversationTitleDoc,
  deleteConversation as deleteConversationDoc,
  generateConversationTitle,
} from '@/lib/conversations';
import toast from 'react-hot-toast';

type ChatState = {
  // Conversation management
  currentConversationId: string | null;
  conversations: Conversation[];
  conversationsLoading: boolean;
  
  // Messages
  messages: ChatMessage[];
  messagesLoading: boolean;
  messageListener: Unsubscribe | null;
  
  // UI state
  isLoading: boolean;
  isMobileMenuOpen: boolean;
  
  // Actions
  createConversation: (userId: string) => Promise<string>;
  loadConversation: (conversationId: string) => void;
  loadConversations: (userId: string) => Promise<void>;
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>, userId: string) => Promise<void>;
  clearCurrentConversation: () => void;
  toggleMobileMenu: () => void;
  setLoading: (loading: boolean) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  currentConversationId: null,
  conversations: [],
  conversationsLoading: false,
  messages: [],
  messagesLoading: false,
  messageListener: null,
  isLoading: false,
  isMobileMenuOpen: false,

  // Create new conversation
  createConversation: async (userId: string) => {
    try {
      const conversationId = await createConversation(userId);
      await get().loadConversations(userId);
      get().loadConversation(conversationId);
      return conversationId;
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
      throw error;
    }
  },

  // Load conversation and set up real-time listener
  loadConversation: (conversationId: string) => {
    const state = get();
    
    // Clean up existing listener
    if (state.messageListener) {
      state.messageListener();
    }
    
    set({ 
      currentConversationId: conversationId,
      messages: [],
      messagesLoading: true,
      messageListener: null,
    });

    const messagesRef = getMessagesCollection(conversationId);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            role: data.role,
            content: data.content,
            sources: data.sources,
            checklist: data.checklist,
            createdAt: data.createdAt?.toDate(),
          };
        });
        
        set({ messages, messagesLoading: false });
      },
      (error) => {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
        set({ messagesLoading: false });
      }
    );

    set({ messageListener: unsubscribe });
  },

  // Load user's conversations for sidebar
  loadConversations: async (userId: string) => {
    set({ conversationsLoading: true });
    try {
      const conversations = await getUserConversations(userId);
      set({ conversations, conversationsLoading: false });
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
      set({ conversationsLoading: false });
    }
  },

  // Update conversation title
  updateConversationTitle: async (conversationId: string, title: string) => {
    try {
      await updateConversationTitleDoc(conversationId, title);
      const state = get();
      const updated = state.conversations.map(c => 
        c.id === conversationId ? { ...c, title } : c
      );
      set({ conversations: updated });
    } catch (error: any) {
      console.error('Failed to update conversation title:', error);
      toast.error('Failed to update conversation title');
      throw error;
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId: string) => {
    try {
      await deleteConversationDoc(conversationId);
      const state = get();
      const filtered = state.conversations.filter(c => c.id !== conversationId);
      set({ conversations: filtered });
      
      // If deleting current conversation, clear it
      if (state.currentConversationId === conversationId) {
        get().clearCurrentConversation();
      }
    } catch (error: any) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
      throw error;
    }
  },

  // Add message to current conversation (creates conversation if needed)
  addMessage: async (message: Omit<ChatMessage, 'id' | 'createdAt'>, userId: string) => {
    const state = get();
    let conversationId = state.currentConversationId;
    const isNewConversation = !conversationId;
    const isFirstUserMessage = message.role === 'user' && state.messages.length === 0;

    // Create conversation if none exists
    if (!conversationId) {
      conversationId = await get().createConversation(userId);
    }

    try {
      // Add message to Firestore (real-time listener will update state)
      await addMessageToConversation(conversationId, message);
      
      // If this is the first user message in a new conversation, generate title
      if (isNewConversation && isFirstUserMessage) {
        const title = generateConversationTitle(message.content);
        // Small delay to ensure message is written first
        setTimeout(async () => {
          try {
            await updateConversationTitleDoc(conversationId!, title);
            await get().loadConversations(userId);
          } catch (error) {
            console.error('Failed to update conversation title:', error);
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Failed to add message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  },

  // Clear current conversation and cleanup
  clearCurrentConversation: () => {
    const state = get();
    if (state.messageListener) {
      state.messageListener();
    }
    set({
      currentConversationId: null,
      messages: [],
      messageListener: null,
    });
  },

  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));


