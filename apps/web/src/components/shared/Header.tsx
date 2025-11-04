import { Menu } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useAuth } from '@/hooks/use-auth';
import Logo from './Logo';

export default function Header() {
  const toggle = useChatStore((s) => s.toggleMobileMenu);
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-20 bg-transparent">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-3 md:hidden">
          <button
            className="p-2 rounded-md hover:bg-white/70 focus-ring"
            aria-label="Open menu"
            onClick={toggle}
          >
            <Menu className="size-5" />
          </button>
        </div>
        <Logo className="text-lg" />
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="size-8 md:size-9 rounded-full border-2 border-white/50" 
            />
          ) : (
            <div className="size-8 md:size-9 rounded-full bg-gray-300 border-2 border-white/50" />
          )}
        </div>
      </div>
    </header>
  );
}


