import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ChatInput() {
  const { addMessage, setLoading, isLoading } = useChatStore((s) => ({
    addMessage: s.addMessage,
    setLoading: s.setLoading,
    isLoading: s.isLoading,
  }));
  const [value, setValue] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    const text = value.trim();
    setValue('');
    addMessage({ id: crypto.randomUUID(), role: 'user', content: text });
    setLoading(true);

    // Phase 2 mock
    setTimeout(() => {
      addMessage({
        id: crypto.randomUUID(),
        role: 'bot',
        content:
          'To operate a digital agency in Zambia and collect user data, you must register with the Data Protection Commissioner. $${'+'}$Source: The Data Protection Act, Sec. 40$${'+'}$',
        sources: [{ title: 'The Data Protection Act, Sec. 40' }],
      });
      setLoading(false);
    }, 1500);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto p-4">
      <div className="glass pill flex items-center gap-2 p-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={1}
          placeholder="Ask whatever you want"
          className="flex-1 bg-transparent border-0 focus:ring-0"
        />
        <Button type="submit" disabled={isLoading} aria-disabled={isLoading} className="gap-1">
          <Send className="size-4" />
          Send
        </Button>
      </div>
    </form>
  );
}


