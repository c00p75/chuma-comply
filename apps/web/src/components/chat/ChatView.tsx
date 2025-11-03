import MessageList from './MessageList';
import PromptStarter from './PromptStarter';
import ChatInput from './ChatInput';
import { useChatStore } from '@/store/chatStore';

export default function ChatView() {
  const messages = useChatStore((s) => s.messages);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {messages.length === 0 ? (
          <div className="h-full grid place-items-center">
            <PromptStarter />
          </div>
        ) : (
          <MessageList />
        )}
      </div>
      <div className="sticky bottom-0">
        <ChatInput />
      </div>
    </div>
  );
}


