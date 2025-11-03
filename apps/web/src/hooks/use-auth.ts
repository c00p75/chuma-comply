import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true });

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (unsubProfile) unsubProfile();
        setState({ user: null, profile: null, loading: false });
        return;
      }

      setState({ user, profile: null, loading: true });
      try {
        const ref = doc(db, 'users', user.uid);
        
        // Listen to real-time updates
        unsubProfile = onSnapshot(
          ref,
          (snapshot) => {
            if (snapshot.exists()) {
              setState({ user, profile: snapshot.data() as UserProfile, loading: false });
            } else {
              // First-time login default profile
              const defaultProfile: UserProfile = {
                uid: user.uid,
                email: user.email ?? '',
                displayName: user.displayName ?? '',
                businessName: '',
                businessDescription: '',
                hasCompletedOnboarding: false,
              };
              setState({ user, profile: defaultProfile, loading: false });
            }
          },
          (error) => {
            console.error('Firestore snapshot error:', error);
            // Fallback: try getDoc
            getDoc(ref).then((snapshot) => {
              if (snapshot.exists()) {
                setState({ user, profile: snapshot.data() as UserProfile, loading: false });
              } else {
                const defaultProfile: UserProfile = {
                  uid: user.uid,
                  email: user.email ?? '',
                  displayName: user.displayName ?? '',
                  businessName: '',
                  businessDescription: '',
                  hasCompletedOnboarding: false,
                };
                setState({ user, profile: defaultProfile, loading: false });
              }
            }).catch(() => {
              setState({ user, profile: null, loading: false });
            });
          }
        );
      } catch {
        setState({ user, profile: null, loading: false });
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  return state;
}


