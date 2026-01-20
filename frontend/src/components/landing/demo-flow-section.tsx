'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { UserPlus, Plus, Upload, Code, MessageSquare, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your free account in seconds',
  },
  {
    icon: Plus,
    title: 'Create Bot',
    description: 'Configure your chatbot with a few clicks',
  },
  {
    icon: Upload,
    title: 'Upload Docs',
    description: 'Train on your documents and knowledge base',
  },
  {
    icon: Code,
    title: 'Embed Widget',
    description: 'Add one line of code to your website',
  },
  {
    icon: MessageSquare,
    title: 'Go Live',
    description: 'Start chatting with your visitors',
  },
];

export function DemoFlowSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Get Up and Running in 5 Steps
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            From idea to live chatbot in under 10 minutes
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-5 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.title} variants={itemVariants} className="relative">
                <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-4">
                    {index + 1}
                  </div>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-800">
            <p className="text-slate-900 dark:text-white font-medium">
              ⏱️ Average setup time: <span className="text-blue-600 dark:text-blue-400 font-bold">7 minutes</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
