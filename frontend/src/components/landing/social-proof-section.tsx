'use client';

import { motion } from 'framer-motion';

const companies = [
  { name: 'Vercel', initials: 'V' },
  { name: 'Stripe', initials: 'ST' },
  { name: 'Notion', initials: 'N' },
  { name: 'Figma', initials: 'F' },
  { name: 'Supabase', initials: 'SB' },
  { name: 'GitHub', initials: 'GH' },
];

export function SocialProofSection() {
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2"
        >
          Trusted by Leading Teams
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-500"
        >
          Used by thousands of developers worldwide
        </motion.p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
      >
        {companies.map((company) => (
          <motion.div
            key={company.name}
            variants={itemVariants}
            className="flex items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{company.initials}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
