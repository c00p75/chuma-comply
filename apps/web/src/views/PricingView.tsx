import LandingNav from '@/components/shared/LandingNav';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary">
      <LandingNav />

      {/* Hero Section */}
      <section className="pt-24 pb-section px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Start free, upgrade as you grow. Choose the plan that fits your business needs.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-section px-6 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Spark Tier */}
            <div className="bg-primary border border-primary rounded-xl p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-2">Spark</h3>
                <p className="text-text-secondary text-sm mb-4">The General Guide</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">K0</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-6">
                Perfect for new entrepreneurs, students, and general businesses
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">PACRA (Business Name & Company Registration)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">ZRA (Tax & VAT Registration)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">NAPSA (Pension Contributions)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Employment Code (Hiring & Contracts)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Data Protection Act (General Data Handling)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">AI-powered compliance checklists</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Instant, actionable guidance</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/signup')} variant="outline" className="w-full">
                Get Started
              </Button>
            </div>

            {/* Entrepreneur Tier */}
            <div className="bg-primary border-2 border-inverse rounded-xl p-8 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-inverse text-text-inverse px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-2">Entrepreneur</h3>
                <p className="text-text-secondary text-sm mb-4">The Industry Specialist</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">K299</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-6">
                For high-stakes industries: Food Service, Construction, Mining, Healthcare, Finance
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Everything in Spark tier</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Industry-specific laws and regulations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Deep knowledge base access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Personalized checklists for specialized industries</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Food Safety Act coverage</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Mines and Minerals Act coverage</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Health Professions Act coverage</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Prevents costly, industry-specific fines</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/signup')} className="w-full">
                Get Started
              </Button>
            </div>

            {/* Accelerator Tier */}
            <div className="bg-primary border border-primary rounded-xl p-8 shadow-sm">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold mb-2">Accelerator</h3>
                <p className="text-text-secondary text-sm mb-4">The Compliance Accelerator</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">K699</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-6">
                For serious businesses that want to move from knowing what to do to getting it done
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Everything in Entrepreneur tier</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Compliance Workflows</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Form Filling (guided, in-app forms)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Secure Document Upload (document vault)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Status Tracking (dashboard for submissions)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Full lifecycle compliance management</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-5 text-inverse bg-inverse rounded-full p-1 flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary text-sm">Turns advisor into agent</span>
                </li>
              </ul>
              <Button onClick={() => navigate('/signup')} variant="outline" className="w-full">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-section px-6 bg-primary">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center mb-12">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-primary">
                  <th className="text-left py-4 px-4 font-semibold text-text-primary">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-text-primary">Spark</th>
                  <th className="text-center py-4 px-4 font-semibold text-text-primary">Entrepreneur</th>
                  <th className="text-center py-4 px-4 font-semibold text-text-primary">Accelerator</th>
                </tr>
              </thead>
              <tbody className="text-text-secondary">
                <tr className="border-b border-primary">
                  <td className="py-4 px-4">General Business Compliance</td>
                  <td className="text-center py-4 px-4">
                    <Check className="size-5 text-inverse bg-inverse rounded-full p-1 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="size-5 text-inverse bg-inverse rounded-full p-1 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="size-5 text-inverse bg-inverse rounded-full p-1 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-primary">
                  <td className="py-4 px-4">Industry-Specific Regulations</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">
                    <Check className="size-5 text-inverse bg-inverse rounded-full p-1 mx-auto" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <Check className="size-5 text-inverse bg-inverse rounded-full p-1 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-primary">
                  <td className="py-4 px-4">Compliance Workflows</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">
                    <Check className="size-5 text-inverse bg-inverse rounded-full p-1 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-primary">
                  <td className="py-4 px-4">Form Filling</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">
                    <Check className="size-5 text-inverse bg-inverse rounded-full p-1 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-primary">
                  <td className="py-4 px-4">Document Vault</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">
                    <Check className="size-5 text-inverse bg-inverse rounded-full p-1 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4">Status Tracking Dashboard</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">
                    <Check className="size-5 text-inverse bg-inverse rounded-full p-1 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section-lg px-6 bg-inverse text-text-inverse">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-4 text-text-inverse">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Start with our free tier and upgrade as your business grows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/signup')} size="md" className="bg-primary text-text-primary hover:opacity-90">
              Start Free Trial
            </Button>
            <Button onClick={() => navigate('/pricing')} variant="outline" size="md" className="border-text-inverse text-text-inverse hover:bg-white/10">
              View All Plans
            </Button>
          </div>
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

