import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

export default function Terms() {
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
          <h1 className="text-3xl font-bold mb-6 font-['Space_Grotesk'] text-brand-text">Terms of Service</h1>
          <p className="text-sm text-brand-text-muted mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-brand-text/90 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using adtAI, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p>adtAI provides users with access to a rich collection of AI resources, including but not limited to chat interfaces, code generation, and image processing tools.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Conduct</h2>
              <p>You agree to not use the Service to upload, post, email, transmit or otherwise make available any content that is unlawful, harmful, threatening, abusive, or harassing.</p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
