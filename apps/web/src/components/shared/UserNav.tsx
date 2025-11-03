import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

export default function UserNav() {
  const { user } = useAuth();
  return (
    <div className="flex items-center justify-between gap-3 p-3 border-t">
      <div className="flex items-center gap-2 min-w-0">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="size-8 rounded-full" />
        ) : (
          <div className="size-8 rounded-full bg-gray-200" />
        )}
        <div className="truncate">
          <div className="text-sm font-medium truncate">{user?.displayName ?? 'Anonymous'}</div>
          <div className="text-xs text-gray-500 truncate">{user?.email}</div>
        </div>
      </div>
      <button
        className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50 focus-ring"
        onClick={() => auth.signOut()}
      >
        Sign out
      </button>
    </div>
  );
}


