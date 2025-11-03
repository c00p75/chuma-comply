import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import { Database, MessageSquare } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import UserNav from './UserNav';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { isMobileMenuOpen, toggleMobileMenu } = useChatStore((s) => ({
    isMobileMenuOpen: s.isMobileMenuOpen,
    toggleMobileMenu: s.toggleMobileMenu,
  }));

  return (
    <aside
      className={cn(
        'fixed md:static inset-0 md:inset-auto z-30 md:z-auto w-full md:w-64 glass rounded-2xl md:rounded-xl md:mr-4 flex flex-col',
        isMobileMenuOpen ? 'block' : 'hidden md:flex'
      )}
      role="complementary"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Logo />
        <button className="md:hidden text-sm px-2 py-1 border rounded-md" onClick={toggleMobileMenu}>Close</button>
      </div>
      <nav className="flex-1 p-2 space-y-1" aria-label="Main">
        <NavItem to="/" icon={<MessageSquare className="size-4" />}>Chat</NavItem>
        <NavItem to="/knowledge" icon={<Database className="size-4" />}>Knowledge Base</NavItem>
      </nav>
      <UserNav />
    </aside>
  );
}

function NavItem({ to, children, icon }: { to: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 px-3 py-2 rounded-md focus-ring',
          isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
        )
      }
    >
      {icon}
      <span>{children}</span>
    </NavLink>
  );
}


