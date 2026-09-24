'use client';

import Link from 'next/link';
import { Bot } from 'lucide-react';

// Only links that actually resolve. Anything that 404s or goes to "#" is worse
// than absent: it invites a click that does nothing.
const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API', href: '#api' },
      { name: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { name: 'Create an account', href: '/auth/signup' },
      { name: 'Sign in', href: '/auth/login' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Widget preview', href: '/widget-preview' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-300 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 md:max-w-sm">
            <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">AI Chatbot</span>
            </Link>
            <p className="text-sm text-slate-400">
              The easiest way to add intelligent chatbots to your website.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold text-white mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-blue-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="py-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>© 2026 AI Chatbot Platform. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#features" className="hover:text-blue-400 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-blue-400 transition-colors">
              Pricing
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
