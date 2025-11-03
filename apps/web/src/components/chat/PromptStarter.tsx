import { useAuth } from '@/hooks/use-auth';
import { useChatStore } from '@/store/chatStore';
import { MessageSquare, ClipboardList, Shield } from 'lucide-react';

const starters = [
  {
    title: 'Start a digital agency',
    text: "I'm starting a digital agency in Lusaka and will collect user emails. What should I do to comply?",
    icon: <MessageSquare className="size-4" />,
  },
  {
    title: 'Register my business',
    text: 'What are the steps to register my business name with PACRA and ZRA?',
    icon: <ClipboardList className="size-4" />,
  },
  {
    title: 'Handle user data',
    text: 'What are the Data Protection requirements when collecting customer emails?',
    icon: <Shield className="size-4" />,
  },
];

export default function PromptStarter() {
  const { profile } = useAuth();
  const { addMessage } = useChatStore();

  function sendPrompt(text: string) {
    addMessage({ id: crypto.randomUUID(), role: 'user', content: text });
  }

  return (
    <div className="max-w-3xl w-full text-center">
      <div className="mb-6">
        <div className="text-sm text-text-secondary">Hi {profile?.displayName || 'there'}</div>
        <h2 className="text-3xl font-semibold">What would you like to know?</h2>
        <p className="text-text-secondary">Use one of the common prompts below or ask your own.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {starters.map((s, i) => (
          <button
            key={i}
            className="glass rounded-xl p-4 text-left hover:bg-white/80 focus-ring"
            onClick={() => sendPrompt(s.text)}
          >
            <div className="flex items-center gap-2 text-sm font-medium mb-1">{s.icon} {s.title}</div>
            <div className="text-xs text-text-secondary">{s.text}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


