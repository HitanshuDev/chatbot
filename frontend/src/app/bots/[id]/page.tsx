'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatUI } from '@/components/dashboard/chat-ui';
import { StatCard } from '@/components/dashboard/stat-card';
import { apiClient } from '@/lib/api';
import { createChatClient } from "@/lib/chatApi";

import {
  MessageSquare,
  Settings,
  BarChart3,
  FileText,
  Copy,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Bot, Message, Conversation } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BotDetailPage() {
  
  const router = useRouter();
  const params = useParams();
  const botId = params.id as string;
  const { user } = useAuthStore();
  
  const [bot, setBot] = useState<Bot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [copied, setCopied] = useState(false);

useEffect(() => {
  if (!user) {
    router.push("/auth/login");
    return;
  }

  const init = async () => {
    try {
      setIsLoading(true);

      // 1️⃣ Fetch bot
      const botRes = await apiClient.getBot(botId);
      setBot(botRes.bot);

      // 2️⃣ Create conversation
      const convoRes = await apiClient.createConversation(botId);
      setConversation(convoRes.conversation);

      // 3️⃣ Load messages (empty initially)
      setMessages([]);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load bot");
    } finally {
      setIsLoading(false);
    }
  };

  init();
}, [router, botId, user]);


  const handleSendMessage = async (content: string) => {
    if (!conversation) return;

    // 1️⃣ Optimistic user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversation.id,
      botId,
      sender: "user",
      content,
      tokens: 0,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      // 2️⃣ Send to backend
      const res = await apiClient.sendMessage(conversation.id, content);

      // 3️⃣ Append bot message from backend
      const botMessage: Message = {
        id: res.message.id,
        conversationId: conversation.id,
        botId,
        sender: "bot",
        content: res.message.content,
        tokens: 0,
        createdAt: new Date(res.message.createdAt),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.log(err);
      toast.error("Failed to send message");
    }
  };

  const copyApiKey = () => {
    if (bot?.apiKey) {
      navigator.clipboard.writeText(bot.apiKey);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/bots">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{bot?.name}</h1>
            <p className="text-slate-600 mt-1">{bot?.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Model"
            value={bot?.model || 'N/A'}
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="Temperature"
            value={`${bot?.temperature}`}
            description="Creativity level"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <StatCard
            title="Max Tokens"
            value={bot?.maxTokens || 0}
            description="Response limit"
          />
          <StatCard
            title="Theme"
            value={bot?.theme || 'N/A'}
            description="UI appearance"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <FileText className="h-4 w-4" />
              API
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <div className="h-96">
              <ChatUI
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Adjust your bot's behavior and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Prompt</label>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {bot?.initialPrompt}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temperature</label>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {bot?.temperature}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Tokens</label>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {bot?.maxTokens}
                    </p>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Edit Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">156</div>
                  <p className="text-xs text-slate-600 mt-2">↑ 12% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg. Messages/Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">18.2</div>
                  <p className="text-xs text-slate-600 mt-2">↑ 3% improvement</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Key</CardTitle>
                <CardDescription>
                  Use this key to integrate the bot with your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-slate-50 p-3 rounded-lg text-sm font-mono overflow-x-auto">
                      {bot?.apiKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyApiKey}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Widget Embed Code</label>
                  <code className="block bg-slate-50 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {`<script src="https://chatbot.ai/widget.js"></script>
<script>
  ChatBot.init({
    apiKey: "${bot?.apiKey}",
    botId: "${botId}"
  });
</script>`}
                  </code>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Copy Embed Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
