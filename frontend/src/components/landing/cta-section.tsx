'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 md:p-16 text-center text-white overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
          
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Create a bot, upload your documents, and drop one line of script onto your site. Start on the free plan and upgrade when you need to.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup" className="sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 px-8 shadow-lg shadow-blue-900/20"
                >
                  Start Building Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/widget-preview" className="sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-transparent border-2 border-white/70 text-white hover:bg-white hover:text-blue-700 hover:border-white px-8 transition-colors"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-blue-100">
              <span className="inline-flex items-center gap-2">
                <Check className="w-4 h-4" aria-hidden="true" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="w-4 h-4" aria-hidden="true" />
                Set up in a few minutes
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="w-4 h-4" aria-hidden="true" />
                Free plan available
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
