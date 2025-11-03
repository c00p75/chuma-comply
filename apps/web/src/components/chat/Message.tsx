import type { ChatMessage } from '@/lib/types';
import Logo from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

export default function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mt-1">
          <Logo className="text-sm" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 text-sm rounded-2xl',
          isUser ? 'bg-secondary' : 'glass'
        )}
      >
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 text-xs text-text-secondary">
            <div className="mb-1 font-medium">Sources:</div>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-secondary border-primary border">{s.title}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


