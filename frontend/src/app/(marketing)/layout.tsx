import type { Metadata } from 'next';
import { MarketingNav } from '@/components/landing/marketing-nav';

export const metadata: Metadata = {
  title: 'AI Chatbot Platform - Build Intelligent Chatbots',
  description: 'Create powerful AI chatbots without coding. Deploy in minutes, scale instantly.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingNav />

      {/* Content - Add pt-16 for header spacing */}
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
