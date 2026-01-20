'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function WidgetPreviewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(false);
  }, [user, router]);

  const embedCode = `<script src="https://chatbot.ai/widget.js"></script>
<script>
  ChatBot.init({
    apiKey: "sk_test_abc123def456",
    botId: "bot_123456"
  });
</script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Widget Preview</h1>
          <p className="text-slate-600 mt-2">
            Test your chatbot widget and get embed code
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                This is how your widget will appear on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-8 h-96 flex items-end justify-end relative">
                {/* Mock Website */}
                <div className="absolute inset-0 p-4 text-white text-sm">
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded" />
                    <div className="h-4 bg-white/10 rounded w-5/6" />
                  </div>
                </div>

                {/* Widget */}
                <div className="w-80 h-96 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">ChatBot Assistant</h3>
                      <p className="text-xs opacity-90">Typically replies instantly</p>
                    </div>
                    <button className="text-white/60 hover:text-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="flex justify-start">
                      <div className="bg-slate-100 text-slate-900 rounded-lg px-3 py-2 text-sm max-w-xs">
                        Hi! How can I help you today?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm max-w-xs">
                        Tell me about your pricing
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-slate-100 text-slate-900 rounded-lg px-3 py-2 text-sm max-w-xs">
                        We offer flexible plans for all sizes...
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="border-t p-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-50 text-sm rounded px-3 py-2 outline-none"
                    />
                    <button className="bg-blue-600 text-white rounded px-3 py-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Copy this code to your website's HTML
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">HTML Code</label>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                  <code>{embedCode}</code>
                </pre>
              </div>

              <Button
                onClick={copyCode}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Embed Code
              </Button>

              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-sm">Installation Steps</h4>
                <ol className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="font-semibold text-slate-900">1.</span>
                    <span>Copy the code above</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-slate-900">2.</span>
                    <span>Paste it before the closing &lt;/body&gt; tag</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-slate-900">3.</span>
                    <span>The widget will appear on your website</span>
                  </li>
                </ol>
              </div>

              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
