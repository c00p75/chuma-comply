import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function OnboardingView() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!user) {
      toast.error('You must be signed in to complete onboarding');
      return;
    }

    setLoading(true);
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email ?? '',
          displayName: user.displayName ?? '',
          businessName,
          businessDescription,
          hasCompletedOnboarding: true,
        },
        { merge: true }
      );
      toast.success('Onboarding completed!');
      // The useAuth hook will detect the profile change and redirect automatically
    } catch (error: any) {
      console.error('Firestore write error:', error);
      const message = error.code === 'permission-denied'
        ? 'Permission denied. Please check your Firestore security rules.'
        : error.message || 'Failed to save onboarding data. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full grid place-items-center p-6">
      <div className="w-full max-w-lg bg-white border rounded-xl p-6">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Welcome to Chuma Comply</h2>
            <label className="block text-sm mb-1">What is your business name?</label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Grace Digital Ltd"
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!businessName.trim()}>Continue</Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Tell us about your business</h2>
            <label className="block text-sm mb-1">Briefly describe your business</label>
            <Textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              rows={5}
              placeholder="I'm a digital agency that will collect user emails..."
            />
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={submit} disabled={!businessDescription.trim() || loading}>
                {loading ? 'Saving...' : 'Finish'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


