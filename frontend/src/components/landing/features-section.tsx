'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { FileText, Code, BarChart3, Zap } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Document Upload & RAG',
    description: 'Train your bot on your own documents. Upload PDFs, docs, and text files to create a smart knowledge base.',
  },
  {
    icon: Code,
    title: 'Widget Embed',
    description: 'Embed with one line of code. No complex integrations needed. Works on any website.',
  },
  {
    icon: Zap,
    title: 'Developer API',
    description: 'Full REST API for building custom integrations. Comprehensive documentation included.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Insights',
    description: 'Track conversations, messages, user engagement, and bot performance with detailed dashboards.',
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Everything you need to build, deploy, and scale your AI chatbot
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full p-8 hover:shadow-lg transition-shadow cursor-pointer group hover:border-blue-400 dark:hover:border-blue-600">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
