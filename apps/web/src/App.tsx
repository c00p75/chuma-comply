import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import LandingView from '@/views/LandingView';
import PricingView from '@/views/PricingView';
import AuthView from '@/views/AuthView';
import OnboardingView from '@/views/OnboardingView';
import AppLayout from '@/views/AppLayout';
import ChatView from '@/components/chat/ChatView';
import KnowledgeBaseView from '@/components/knowledge/KnowledgeBaseView';

function ProtectedLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-full grid place-items-center">
        <div className="animate-pulse text-text-secondary">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!profile?.hasCompletedOnboarding) {
    return <OnboardingView />;
  }

  return <AppLayout />;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-full grid place-items-center">
        <div className="animate-pulse text-text-secondary">Loading…</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingView />} />
      <Route path="/pricing" element={<PricingView />} />
      <Route path="/signin" element={<AuthView />} />
      <Route path="/signup" element={<AuthView />} />

      {/* Protected routes - SPA mode */}
      <Route element={<ProtectedLayout />}>
        <Route path="/app" element={<ChatView />} />
        <Route path="/app/:conversationId" element={<ChatView />} />
        <Route path="/chat/:conversationId" element={<ChatView />} />
        <Route path="/chat" element={<ChatView />} />
        <Route path="/knowledge-base" element={<KnowledgeBaseView />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


