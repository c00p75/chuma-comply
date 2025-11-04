import { useChatStore } from '@/store/chatStore';
import { useAuth } from '@/hooks/use-auth';
import { Plus, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function ConversationSidebar() {
  const { user } = useAuth();
  const {
    conversations,
    conversationsLoading,
    currentConversationId,
    createConversation,
    loadConversation,
    deleteConversation,
    isMobileMenuOpen,
    toggleMobileMenu,
  } = useChatStore((s) => ({
    conversations: s.conversations,
    conversationsLoading: s.conversationsLoading,
    currentConversationId: s.currentConversationId,
    createConversation: s.createConversation,
    loadConversation: s.loadConversation,
    deleteConversation: s.deleteConversation,
    isMobileMenuOpen: s.isMobileMenuOpen,
    toggleMobileMenu: s.toggleMobileMenu,
  }));

  async function handleNewChat() {
    if (!user) return;
    try {
      await createConversation(user.uid);
    } catch (error) {
      // Error already shown by store
    }
  }

  async function handleDeleteConversation(e: React.MouseEvent, conversationId: string) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(conversationId);
      } catch (error) {
        // Error already shown by store
      }
    }
  }

  function handleSelectConversation(conversationId: string) {
    loadConversation(conversationId);
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  }

  return (
    <aside
      className={cn(
        'fixed md:static inset-0 md:inset-auto z-30 md:z-auto w-full md:w-64 flex flex-col glass rounded-xl',
        isMobileMenuOpen ? 'block' : 'hidden md:flex'
      )}
      role="complementary"
    >
      <div className="p-4 border-b flex items-center justify-between gap-3">
        <button
          onClick={handleNewChat}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] transition-colors focus-ring"
        >
          <Plus className="size-4" />
          <span className="font-medium">New Chat</span>
        </button>
        <button
          className="md:hidden p-2 rounded-md hover:bg-white/70 focus-ring"
          onClick={toggleMobileMenu}
          aria-label="Close menu"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversationsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-text-secondary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-text-secondary">No conversations yet</p>
            <p className="text-xs text-text-secondary mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const isActive = currentConversationId === conversation.id;
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors focus-ring',
                    isActive
                      ? 'bg-gray-100 font-medium'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <MessageSquare className="size-4 text-text-secondary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text-primary truncate">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {formatRelativeTime(conversation.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                    className={cn(
                      'opacity-0 group-hover:opacity-100 flex items-center justify-center p-1.5 rounded hover:bg-red-50 text-red-600 transition-opacity',
                      isActive && 'opacity-100'
                    )}
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
