'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const codeExamples = [
  {
    title: 'Create a Bot',
    language: 'javascript',
    code: `const response = await fetch('https://api.chatbot.ai/v1/bots', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Support Bot',
    description: 'Helps with customer support',
    initialPrompt: 'You are a helpful support agent',
    model: 'gpt-4',
    temperature: 0.7,
  }),
});

const bot = await response.json();
console.log('Bot created:', bot.id);`,
  },
  {
    title: 'Send a Message',
    language: 'python',
    code: `import requests

response = requests.post(
  'https://api.chatbot.ai/v1/conversations/conv_123/messages',
  headers={'Authorization': 'Bearer YOUR_TOKEN'},
  json={'content': 'Hello, can you help me?'}
)

message = response.json()
print(f'Response: {message["content"]}')
print(f'Tokens used: {message["tokens"]}')`,
  },
];

export function APISection() {
  const [copied, setCopied] = useState<number | null>(null);

  const copyCode = (index: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(index);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
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
            Developer-Friendly API
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Simple REST API. Works with any language. Well documented.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {codeExamples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden h-full flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {example.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {example.language}
                  </p>
                </div>
                <pre className="flex-1 bg-slate-900 text-slate-100 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                  <code>{example.code}</code>
                </pre>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyCode(index, example.code)}
                    className="w-full"
                  >
                    {copied === index ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <a href="/docs/api" className="inline-block">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View Complete API Documentation
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
