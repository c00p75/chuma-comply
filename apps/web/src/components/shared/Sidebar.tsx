import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { Database, MessageSquare, Plus, Loader2, MoreVertical } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuth } from '@/hooks/use-auth';
import UserNav from './UserNav';
import { cn } from '@/lib/utils';

type ViewType = 'chat' | 'knowledge';

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

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    conversations,
    conversationsLoading,
    currentConversationId,
    createConversation,
    loadConversation,
    deleteConversation,
    updateConversationTitle,
    isMobileMenuOpen,
    toggleMobileMenu,
  } = useChatStore((s) => ({
    conversations: s.conversations,
    conversationsLoading: s.conversationsLoading,
    currentConversationId: s.currentConversationId,
    createConversation: s.createConversation,
    loadConversation: s.loadConversation,
    deleteConversation: s.deleteConversation,
    updateConversationTitle: s.updateConversationTitle,
    isMobileMenuOpen: s.isMobileMenuOpen,
    toggleMobileMenu: s.toggleMobileMenu,
  }));

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  
  const isKnowledgeBase = location.pathname === '/knowledge-base';
  const isChatRoute = location.pathname.startsWith('/app') || location.pathname.startsWith('/chat');

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      useChatStore.getState().loadConversations(user.uid);
    }
  }, [user]);

  async function handleNewChat() {
    if (!user) return;
    
    // Navigate to chat view first
    navigate('/app');
    
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
    
    // Then try to create a new conversation
    try {
      const conversationId = await createConversation(user.uid);
      // Navigate to the new conversation
      navigate(`/app/${conversationId}`);
    } catch (error) {
      // Error already shown by store, but view has already switched
      console.error('Failed to create conversation:', error);
    }
  }

  async function handleDeleteConversation(conversationId: string) {
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(conversationId);
        setOpenMenuId(null);
        // If we deleted the current conversation, navigate to /app
        if (location.pathname === `/app/${conversationId}` || location.pathname === `/chat/${conversationId}`) {
          navigate('/app');
        }
      } catch (error) {
        // Error already shown by store
      }
    }
  }

  function handleRenameClick(conversationId: string, currentTitle: string) {
    setRenamingId(conversationId);
    setRenameValue(currentTitle);
    setOpenMenuId(null);
  }

  async function handleRenameSubmit(conversationId: string) {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      await updateConversationTitle(conversationId, renameValue.trim());
      setRenamingId(null);
      setRenameValue('');
    } catch (error) {
      // Error already shown by store
    }
  }

  function handleRenameCancel() {
    setRenamingId(null);
    setRenameValue('');
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuContainerRef.current && !menuContainerRef.current.contains(target)) {
        setOpenMenuId(null);
      }
    }

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);

  // Focus rename input when renaming starts
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  function handleSelectConversation(conversationId: string) {
    navigate(`/app/${conversationId}`);
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  }

  return (
    <aside
      className={cn(
        'fixed md:static inset-0 md:inset-auto z-30 md:z-auto w-full md:w-64 glass rounded-2xl md:rounded-xl md:mr-4 flex flex-col',
        isMobileMenuOpen ? 'block' : 'hidden md:flex'
      )}
      role="complementary"
    >
      <div className="relative flex items-center justify-between p-4">
        <NavLink to="/app">
          {({ isActive }) => (
            <Logo onClick={isActive ? undefined : () => navigate('/app')} />
          )}
        </NavLink>
        <button className="md:hidden text-sm px-2 py-1 border border-[color:var(--border-primary)] rounded-md text-text-primary hover:bg-gray-50" onClick={toggleMobileMenu}>Close</button>
        <div className="absolute bottom-0 left-4 right-4 h-px bg-[color:var(--border-primary)]" />
      </div>

      {/* Navigation Buttons */}
      <div className="relative p-2">
        <NavLink
          to="/knowledge-base"
          className={({ isActive }) =>
            cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md focus-ring text-text-primary transition-colors',
              isActive ? 'bg-gray-100 font-medium text-text-primary' : 'hover:bg-gray-50 text-text-secondary'
            )
          }
        >
          <Database className="size-4" />
          <span>Knowledge Base</span>
        </NavLink>
        <div className="absolute bottom-0 left-2 right-2 h-px bg-[color:var(--border-primary)]" />
      </div>

      {/* Chat History Section - Always visible */}
      <div className="relative p-4">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] transition-colors focus-ring"
        >
          <Plus className="size-4" />
          <span className="font-medium">New Chat</span>
        </button>
        <div className="absolute bottom-0 left-4 right-4 h-px bg-[color:var(--border-primary)]" />
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
              const isActive = location.pathname === `/app/${conversation.id}` || location.pathname === `/chat/${conversation.id}`;
              const isRenaming = renamingId === conversation.id;
              const isMenuOpen = openMenuId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-gray-100 font-medium'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <MessageSquare className="size-4 text-text-secondary flex-shrink-0" />
                  {isRenaming ? (
                    <div className="flex-1 min-w-0">
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameSubmit(conversation.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameSubmit(conversation.id);
                          } else if (e.key === 'Escape') {
                            handleRenameCancel();
                          }
                        }}
                        className="w-full text-sm text-text-primary bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ) : (
                    <>
                      <NavLink
                        to={`/app/${conversation.id}`}
                        onClick={(e) => {
                          if (isMenuOpen) {
                            e.preventDefault();
                          }
                        }}
                        className={({ isActive }) =>
                          cn(
                            'flex-1 min-w-0 cursor-pointer',
                            isActive && 'font-medium'
                          )
                        }
                      >
                        <div className="text-sm text-text-primary truncate">
                          {conversation.title}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {formatRelativeTime(conversation.updatedAt)}
                        </div>
                      </NavLink>
                      <div className="relative" ref={isMenuOpen ? menuContainerRef : null}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : conversation.id);
                          }}
                          className={cn(
                            'opacity-0 group-hover:opacity-100 flex items-center justify-center p-1.5 rounded hover:bg-gray-100 transition-opacity',
                            isActive && 'opacity-100'
                          )}
                          aria-label="Conversation options"
                        >
                          <MoreVertical className="size-4 text-text-secondary" />
                        </button>
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-[color:var(--border-primary)] rounded-md shadow-lg z-50 min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameClick(conversation.id, conversation.title);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-gray-50 rounded-t-md"
                            >
                              Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation.id);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <UserNav />
    </aside>
  );
}


