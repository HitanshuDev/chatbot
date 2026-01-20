'use client';

import { HeroSection } from '@/components/landing/hero-section';
import { SocialProofSection } from '@/components/landing/social-proof-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { DemoFlowSection } from '@/components/landing/demo-flow-section';
import { APISection } from '@/components/landing/api-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQSection } from '@/components/landing/faq-section';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <DemoFlowSection />
      <APISection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
