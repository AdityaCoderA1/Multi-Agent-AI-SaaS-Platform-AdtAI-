import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-['Inter']">
      <div className="max-w-3xl mx-auto px-6 py-12">
        
        <header className="flex items-center justify-between mb-12">
          <Logo size="small" />
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-brand-text-muted hover:text-brand-text transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </header>

        <main className="bg-brand-card rounded-2xl shadow-sm border border-brand-border p-8 md:p-12">
          <h1 className="text-3xl font-bold mb-6 font-['Space_Grotesk'] text-brand-text">Privacy Policy</h1>
          <p className="text-sm text-brand-text-muted mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-brand-text/90 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create or modify your account, use our services, request customer support, or communicate with us.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, such as to personalize and improve your experience, and to provide customer support.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Security</h2>
              <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
