import { useAuth } from '@/hooks/use-auth';
import { useChatStore } from '@/store/chatStore';
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
  const { addMessage } = useChatStore();

  async function sendPrompt(text: string) {
    if (!user) return;
    try {
      await addMessage({ role: 'user', content: text }, user.uid);
    } catch (error) {
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
            className="glass-app-card rounded-2xl p-5 md:p-6 text-left hover:bg-white/90 transition-all focus-ring group"
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


