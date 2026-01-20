'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, Plus, MessageSquare, Settings, Trash2, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Bot } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BotsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Simulate loading bots
    setTimeout(() => {
      setBots([
        {
          id: '1',
          name: 'Customer Support Bot',
          ownerId: user.id,
          apiKey: 'sk_test_abc123',
          description: 'Handles customer inquiries and support tickets',
          theme: 'light',
          initialPrompt: 'You are a helpful customer support agent.',
          temperature: 0.7,
          maxTokens: 2000,
          model: 'gpt-4',
          embeddings: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Sales Assistant',
          ownerId: user.id,
          apiKey: 'sk_test_def456',
          description: 'Assists with product information and sales',
          theme: 'dark',
          initialPrompt: 'You are a professional sales assistant.',
          temperature: 0.5,
          maxTokens: 1500,
          model: 'gpt-4',
          embeddings: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Knowledge Base Bot',
          ownerId: user.id,
          apiKey: 'sk_test_ghi789',
          description: 'Answers questions from your knowledge base',
          theme: 'light',
          initialPrompt: 'You are an expert in our domain.',
          temperature: 0.8,
          maxTokens: 2500,
          model: 'gpt-4',
          embeddings: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      setIsLoading(false);
    }, 800);
  }, [user, router]);

  const handleDelete = async (botId: string) => {
    if (confirm('Are you sure you want to delete this bot?')) {
      setBots(bots.filter((b) => b.id !== botId));
      toast.success('Bot deleted successfully');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Bots</h1>
            <p className="text-slate-600 mt-2">
              Manage and monitor your chatbots
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="h-4 w-4" />
            Create Bot
          </Button>
        </div>

        {/* Bots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            : bots.map((bot) => (
                <Card
                  key={bot.id}
                  className="group hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{bot.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {bot.description || 'No description'}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/bots/${bot.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/bots/${bot.id}/config`}>
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/bots/${bot.id}/conversations`}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Conversations
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(bot.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Model</span>
                        <Badge variant="outline">{bot.model}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Temperature</span>
                        <span className="text-sm font-medium">{bot.temperature}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link href={`/bots/${bot.id}/conversations`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </Link>
                        <Link href={`/bots/${bot.id}/config`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Config
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {!isLoading && bots.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-slate-100 p-4 mb-4">
                <Plus className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900">No bots yet</h3>
              <p className="text-slate-600 text-sm mt-1">
                Create your first chatbot to get started
              </p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Create Bot
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
