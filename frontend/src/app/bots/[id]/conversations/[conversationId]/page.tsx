'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { Message } from '@/types';

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.id as string;
  const conversationId = params.conversationId as string;
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    useAuthStore.getState().hydrate();

    if (!useAuthStore.getState().user) {
      router.push('/auth/login');
      return;
    }

    (async () => {
      try {
        const [convRes, msgRes] = await Promise.all([
          apiClient.getConversation(conversationId),
          apiClient.getMessages(conversationId),
        ]);

        const conv = convRes.conversation;
        setTitle(conv?.title ?? null);
        setStartedAt(conv?.createdAt ?? null);
        setMessages(
          (msgRes.messages ?? []).map((m: any) => ({ ...m, id: m._id ?? m.id }))
        );
      } catch (err: any) {
        if (err?.statusCode === 404) {
          setNotFound(true);
        } else {
          toast.error(err?.message ?? 'Failed to load conversation');
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [conversationId, router]);

  if (!user) return null;

  const userCount = messages.filter((m) => m.sender === 'user').length;
  const botCount = messages.length - userCount;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-8">
        <div className="flex items-center gap-4">
          <Link href={`/bots/${botId}/conversations`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {title || 'Conversation'}
            </h1>
            <p className="text-slate-600 mt-1">
              {startedAt
                ? `Started ${new Date(startedAt).toLocaleString()}`
                : 'Transcript'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Transcript</CardTitle>
              <CardDescription>Read-only history of this conversation</CardDescription>
            </div>
            {!isLoading && !notFound && messages.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="secondary">{userCount} from user</Badge>
                <Badge variant="secondary">{botCount} from bot</Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : notFound ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 mb-4">
                  This conversation no longer exists.
                </p>
                <Link href={`/bots/${botId}/conversations`}>
                  <Button variant="outline" size="sm">
                    Back to conversations
                  </Button>
                </Link>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">
                  No messages were exchanged in this conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="max-w-lg">
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p
                        className={`text-xs text-slate-500 mt-1 ${
                          msg.sender === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
