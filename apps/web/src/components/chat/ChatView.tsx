import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import PromptStarter from './PromptStarter';
import ChatInput from './ChatInput';
import { useChatStore } from '@/store/chatStore';
import { useAuth } from '@/hooks/use-auth';

export default function ChatView() {
  const { user } = useAuth();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { 
    messages, 
    messagesLoading, 
    loadConversations, 
    clearCurrentConversation,
    loadConversation,
    currentConversationId,
  } = useChatStore((s) => ({
    messages: s.messages,
    messagesLoading: s.messagesLoading,
    loadConversations: s.loadConversations,
    clearCurrentConversation: s.clearCurrentConversation,
    loadConversation: s.loadConversation,
    currentConversationId: s.currentConversationId,
  }));

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations(user.uid);
    }
    
    // Cleanup listener on unmount
    return () => {
      clearCurrentConversation();
    };
  }, [user, loadConversations, clearCurrentConversation]);

  // Load conversation from URL parameter
  useEffect(() => {
    if (conversationId && conversationId !== currentConversationId) {
      loadConversation(conversationId);
    } else if (!conversationId && currentConversationId) {
      // If no conversationId in URL but we have one loaded, clear it
      clearCurrentConversation();
    }
  }, [conversationId, currentConversationId, loadConversation, clearCurrentConversation]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6 md:py-8">
        {messagesLoading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-sm text-text-secondary">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <PromptStarter />
          </div>
        ) : (
          <MessageList />
        )}
      </div>
      <div className="sticky bottom-0 pt-4">
        <ChatInput />
      </div>
    </div>
  );
}


