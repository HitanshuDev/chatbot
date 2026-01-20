'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'How does RAG (Retrieval Augmented Generation) work?',
    answer:
      'RAG combines document retrieval with language models. Your bot searches your documents for relevant content, then uses that context to generate accurate, grounded responses. This reduces hallucinations and ensures answers are based on your knowledge base.',
  },
  {
    question: 'What file formats can I upload?',
    answer:
      'We support PDF, DOCX, TXT, and markdown files. Files are processed and converted into embeddings that your bot can search and reference during conversations. The maximum file size is 50MB per document.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. All data is encrypted in transit and at rest. We use industry-standard security practices and comply with GDPR, CCPA, and SOC 2 regulations. Your documents are never shared with third parties.',
  },
  {
    question: 'How do embeddings work?',
    answer:
      'Embeddings convert your text into mathematical vectors. These vectors capture semantic meaning, allowing your bot to find relevant documents using similarity search. This enables context-aware responses without keyword matching.',
  },
  {
    question: 'Can I customize the chatbot appearance?',
    answer:
      'Absolutely. You can customize the widget theme, colors, welcome message, and conversation flow. Pro and Enterprise plans include advanced branding options.',
  },
  {
    question: 'What model does the bot use?',
    answer:
      'By default, we use GPT-4. You can select from GPT-3.5 Turbo, GPT-4, or GPT-4 Turbo depending on your needs. Enterprise customers can use custom models.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Everything you need to know to get started
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="p-2 md:p-6 overflow-hidden">
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-slate-900 dark:text-white font-semibold flex-1">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform flex-shrink-0 ml-4 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-center text-slate-600 dark:text-slate-400">
                Have more questions?{' '}
                <a href="mailto:support@chatbot.ai" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Contact our support team
                </a>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
