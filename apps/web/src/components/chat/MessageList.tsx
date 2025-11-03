import { useChatStore } from '@/store/chatStore';
import { AnimatePresence, motion } from 'framer-motion';
import Message from './Message';

export default function MessageList() {
  const { messages, isLoading } = useChatStore((s) => ({ messages: s.messages, isLoading: s.isLoading }));
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3" aria-live="polite">
      <AnimatePresence>
        {messages.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <Message message={m} />
          </motion.div>
        ))}
      </AnimatePresence>
      {isLoading && (
        <div className="text-sm text-gray-500">Chuma is thinking...</div>
      )}
    </div>
  );
}


