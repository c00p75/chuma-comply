import LandingNav from '@/components/shared/LandingNav';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Database, MessageSquare, Shield } from 'lucide-react';

export default function LandingView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary">
      <LandingNav />

      {/* Hero Section */}
      <section className="pt-24 pb-section-lg px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-6">Your Legal Compliance Co-Pilot</h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Navigate Zambian regulations with confidence. Get instant, AI-powered compliance guidance tailored to your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="md" onClick={() => navigate('/signup')} className="gap-2">
              Get Started
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="md" onClick={() => navigate('/signin')}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-section-lg px-6 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center mb-4">What is Chuma Comply?</h2>
          <p className="text-center text-text-secondary mb-12 max-w-2xl mx-auto">
            Chuma Comply is an AI-powered compliance assistant that helps Zambian businesses understand and meet regulatory requirements effortlessly.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="bg-primary border border-primary rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-inverse flex items-center justify-center mb-4">
                <MessageSquare className="size-6 text-text-inverse" />
              </div>
              <h3 className="mb-2">AI-Powered Guidance</h3>
              <p className="text-text-secondary">
                Get instant answers to your compliance questions with context-aware AI that understands Zambian regulations.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-primary border border-primary rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-inverse flex items-center justify-center mb-4">
                <Shield className="size-6 text-text-inverse" />
              </div>
              <h3 className="mb-2">Stay Compliant</h3>
              <p className="text-text-secondary">
                Always up-to-date with the latest regulations. Never miss a compliance requirement for your business type.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-primary border border-primary rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-inverse flex items-center justify-center mb-4">
                <Database className="size-6 text-text-inverse" />
              </div>
              <h3 className="mb-2">Knowledge Base</h3>
              <p className="text-text-secondary">
                Access a comprehensive knowledge base of Zambian laws and regulations, all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-section-lg px-6 bg-primary">
        <div className="max-w-6xl mx-auto">
          <div className="text-sm text-text-secondary mb-2">Use Cases</div>
          <h2 className="mb-4">Chuma Comply in Action</h2>
          <p className="text-text-secondary mb-8 max-w-2xl">
            Chuma Comply offers a variety of use cases for businesses seeking secure and compliant operations in Zambia.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Business Card */}
            <div className="bg-secondary border border-primary rounded-xl p-8">
              <h3 className="mb-3">For Businesses</h3>
              <p className="text-text-secondary mb-6">
                Ensure your business operations comply with Zambian regulations. From registration requirements to data protection compliance, get step-by-step guidance tailored to your industry.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-bg-inverse mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">Business registration guidance</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-bg-inverse mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">Data protection compliance</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-bg-inverse mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">Industry-specific requirements</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/signup')}>
                Get Started →
              </Button>
            </div>

            {/* Developers Card */}
            <div className="bg-secondary border border-primary rounded-xl p-8">
              <h3 className="mb-3">For Developers</h3>
              <p className="text-text-secondary mb-6">
                Integrate compliance checks into your applications. Access our API to provide compliance guidance directly within your platform.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-bg-inverse mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">API access for integrations</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-bg-inverse mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">Real-time compliance checks</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-bg-inverse mt-0.5 flex-shrink-0" />
                  <span className="text-text-secondary">Comprehensive documentation</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/signup')}>
                Learn More →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-lg px-6 bg-inverse text-text-inverse">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4 text-text-inverse">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join businesses across Zambia who trust Chuma Comply for their compliance needs.
          </p>
          <Button onClick={() => navigate('/signup')} size="md" className="bg-primary text-text-primary hover:opacity-90">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-primary">
        <div className="max-w-6xl mx-auto text-center text-text-secondary text-sm">
          <p>© 2024 Chuma Comply. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

