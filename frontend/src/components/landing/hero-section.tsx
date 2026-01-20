'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/auth/login">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Now in beta. Get early access →
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight"
        >
          Add an Intelligent AI Chatbot to Your Website
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            in Minutes
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          Train with your documents, embed with one line of code, and track conversations with powerful analytics. No coding required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-shadow px-8"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/widget-preview">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-8"
            >
              Watch Demo
            </Button>
          </Link>
        </motion.div>

        {/* Product Preview */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 blur-2xl" />
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dashboard Mock */}
              <div className="space-y-3">
                <div className="h-40 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-slate-700 flex items-end justify-center p-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                    <rect x="10" y="40" width="8" height="20" fill="#3b82f6" opacity="0.6" />
                    <rect x="25" y="30" width="8" height="30" fill="#8b5cf6" opacity="0.6" />
                    <rect x="40" y="20" width="8" height="40" fill="#06b6d4" opacity="0.6" />
                    <rect x="55" y="15" width="8" height="45" fill="#ec4899" opacity="0.6" />
                    <rect x="70" y="25" width="8" height="35" fill="#f59e0b" opacity="0.6" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Real-time Analytics</p>
              </div>

              {/* Widget Mock */}
              <div className="space-y-3">
                <div className="h-40 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-lg border border-slate-700 flex items-center justify-end p-4">
                  <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-700 p-3 flex flex-col">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded mb-2" />
                    <div className="flex-1 space-y-2 overflow-hidden">
                      <div className="bg-slate-200 dark:bg-slate-700 h-2 rounded w-2/3" />
                      <div className="bg-slate-200 dark:bg-slate-700 h-2 rounded w-full" />
                      <div className="bg-blue-500 h-2 rounded w-1/2 ml-auto" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-400">Embedded Widget</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
