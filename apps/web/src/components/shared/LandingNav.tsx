import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="#features" className="text-text-secondary hover:text-text-primary transition-colors">
              Features
            </Link>
            <Link to="#use-cases" className="text-text-secondary hover:text-text-primary transition-colors">
              Use Cases
            </Link>
            <Link to="/pricing" className="text-text-secondary hover:text-text-primary transition-colors">
              Pricing
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/signin')} size="sm">
                Sign In
              </Button>
              <Button onClick={() => navigate('/signup')} size="sm">
                Sign Up
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary py-4 space-y-4">
            <Link
              to="#features"
              className="block text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="#use-cases"
              className="block text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Use Cases
            </Link>
            <Link
              to="/pricing"
              className="block text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" onClick={() => { navigate('/signin'); setMobileMenuOpen(false); }} className="w-full">
                Sign In
              </Button>
              <Button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} className="w-full">
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

