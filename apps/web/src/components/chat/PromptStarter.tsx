import { useAuth } from '@/hooks/use-auth';
import { useChatStore } from '@/store/chatStore';
import { trpc } from '@/lib/trpc';
import { MessageSquare, ClipboardList, Shield } from 'lucide-react';

const starters = [
  {
    title: 'Start a digital agency',
    text: "I'm starting a digital agency in Lusaka and will collect user emails. What should I do to comply?",
    icon: <MessageSquare className="size-5" strokeWidth={1.5} />,
  },
  {
    title: 'Register my business',
    text: 'What are the steps to register my business name with PACRA and ZRA?',
    icon: <ClipboardList className="size-5" strokeWidth={1.5} />,
  },
  {
    title: 'Handle user data',
    text: 'What are the Data Protection requirements when collecting customer emails?',
    icon: <Shield className="size-5" strokeWidth={1.5} />,
  },
];

export default function PromptStarter() {
  const { profile, user } = useAuth();
  const { addMessage, setLoading, isLoading } = useChatStore((s) => ({
    addMessage: s.addMessage,
    setLoading: s.setLoading,
    isLoading: s.isLoading,
  }));

  async function sendPrompt(text: string) {
    if (!user || isLoading) return;
    
    try {
      // Add user message
      await addMessage({ role: 'user', content: text }, user.uid);
      setLoading(true);

      // Call RAG API
      try {
        const response = await trpc.rag.getComplianceChecklist.query({ query: text });
        await addMessage({
          role: 'bot',
          content: response.content,
          sources: response.sources,
          checklist: (response as any).checklist,
        }, user.uid);
      } catch (error: any) {
        console.error('Failed to get RAG response:', error);
        await addMessage({
          role: 'bot',
          content: error?.message || 'Sorry, I encountered an error while processing your question. Please try again.',
          sources: [],
        }, user.uid);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      // Error already shown by store
    }
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4">
      <div className="text-center mb-8 md:mb-12">
        <div className="text-base md:text-lg text-text-secondary mb-2">
          Hi {profile?.displayName || 'there'}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
          What would you like to know?
        </h2>
        <p className="text-sm md:text-base text-text-secondary">
          Use one of the most common prompts below or use your own to begin
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
        {starters.map((s, i) => (
          <button
            key={i}
            disabled={isLoading}
            aria-disabled={isLoading}
            className="glass-app-card rounded-2xl p-5 md:p-6 text-left hover:bg-white/90 transition-all focus-ring group disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => sendPrompt(s.text)}
          >
            <div className="mb-3 text-text-primary">
              {s.icon}
            </div>
            <div className="text-sm md:text-base font-medium text-text-primary mb-2">
              {s.title}
            </div>
            <div className="text-xs md:text-sm text-text-secondary leading-relaxed">
              {s.text}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}


