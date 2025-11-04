import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { useAuth } from '@/hooks/use-auth';
import { Send, MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function ChatInput() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addMessage, setLoading, isLoading, currentConversationId, messages } = useChatStore((s) => ({
    addMessage: s.addMessage,
    setLoading: s.setLoading,
    isLoading: s.isLoading,
    currentConversationId: s.currentConversationId,
    messages: s.messages,
  }));
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousConversationId = useRef<string | null>(null);

  // Focus input when a new conversation is created (currentConversationId exists but no messages)
  useEffect(() => {
    if (currentConversationId && messages.length === 0 && textareaRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [currentConversationId, messages.length]);

  // Navigate to conversation URL when a new conversation is created
  useEffect(() => {
    if (currentConversationId && currentConversationId !== previousConversationId.current) {
      // Check if we're not already on this conversation's URL
      const currentPath = window.location.pathname;
      const expectedPath = `/app/${currentConversationId}`;
      if (!currentPath.includes(currentConversationId)) {
        navigate(expectedPath, { replace: true });
      }
      previousConversationId.current = currentConversationId;
    }
  }, [currentConversationId, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || isLoading || !user) return;
    const text = value.trim();
    setValue('');
    
    try {
      // Add user message
      await addMessage({ role: 'user', content: text }, user.uid);
      setLoading(true);

      // Phase 2 mock - TODO: Replace with actual tRPC call
      setTimeout(async () => {
        try {
          await addMessage({
            role: 'bot',
            content:
              'To operate a digital agency in Zambia and collect user data, you must register with the Data Protection Commissioner. $${'+'}$Source: The Data Protection Act, Sec. 40$${'+'}$',
            sources: [{ title: 'The Data Protection Act, Sec. 40' }],
          }, user.uid);
        } finally {
          setLoading(false);
        }
      }, 1500);
    } catch (error) {
      setLoading(false);
      // Error already shown by store
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-4xl mx-auto px-4 pb-6 md:pb-8">
      <div className="glass-input pill flex items-center gap-3 px-4 py-3 md:px-5 md:py-2 focus-within:outline focus-within:outline-2 focus-within:outline-black focus-within:outline-offset-0">
        <MessageCircle className="size-5 text-text-secondary flex-shrink-0" strokeWidth={1.5} />
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={1}
          placeholder="Ask whatever you want"
          className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-base text-text-primary placeholder:text-text-secondary"
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          aria-disabled={isLoading || !value.trim()}
          className="size-9 md:size-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring flex-shrink-0"
        >
          <Send className="size-4 md:size-5" strokeWidth={2} />
        </button>
      </div>
    </form>
  );
}


