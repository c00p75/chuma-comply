import { Menu } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

export default function Header() {
  const toggle = useChatStore((s) => s.toggleMobileMenu);
  return (
    <header className="md:hidden sticky top-0 z-20 glass">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-3">
        <button
          className="p-2 rounded-md hover:bg-white/70 focus-ring"
          aria-label="Open menu"
          onClick={toggle}
        >
          <Menu className="size-5" />
        </button>
        <div className="text-center">
          <div className="font-semibold leading-none">Chuma Comply</div>
          <div className="text-xs text-text-secondary leading-none">Your legal co‑pilot</div>
        </div>
        <div className="w-9" />
      </div>
    </header>
  );
}


