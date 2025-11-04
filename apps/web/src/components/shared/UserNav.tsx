import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

export default function UserNav() {
  const { user } = useAuth();
  return (
    <div className="relative flex items-center justify-between gap-3 p-3">
      <div className="absolute top-0 left-3 right-3 h-px bg-[color:var(--border-primary)]" />
      <div className="flex items-center gap-2 min-w-0">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="size-8 rounded-full" />
        ) : (
          <div className="size-8 rounded-full bg-gray-200" />
        )}
        <div className="truncate">
          <div className="text-sm font-medium truncate text-text-primary">{user?.displayName ?? 'Anonymous'}</div>
          <div className="text-xs truncate text-text-secondary">{user?.email}</div>
        </div>
      </div>
      <button
        className="text-sm px-3 py-1.5 rounded-md border border-[color:var(--border-primary)] hover:bg-gray-50 focus-ring text-text-primary"
        onClick={() => auth.signOut()}
      >
        Sign out
      </button>
    </div>
  );
}


