import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/components/shared/Logo';

export default function AuthView() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUp = location.pathname === '/signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Signed in successfully!');
      }
      // Redirect to main app after successful authentication
      navigate('/app', { replace: true });
    } catch (error: any) {
      const message = error.code === 'auth/email-already-in-use'
        ? 'This email is already registered'
        : error.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : error.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : error.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : 'Authentication failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-secondary">
      <div className="w-full max-w-md">
        <div className="bg-primary border border-primary rounded-xl p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h2 className="text-center mb-2">{isSignUp ? 'Create an account' : 'Sign in'}</h2>
          <p className="text-center text-text-secondary mb-6">
            {isSignUp ? 'Get started with Chuma Comply' : 'Welcome back to Chuma Comply'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/signin')}
                  className="text-text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-text-primary font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
