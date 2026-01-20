'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { Bot, MessageSquare, Users, TrendingUp, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBots: 0,
    totalConversations: 0,
    totalMessages: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // Hydrate auth on mount
    useAuthStore.getState().hydrate();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalBots: 3,
        totalConversations: 156,
        totalMessages: 2840,
        activeUsers: 89,
      });
      setIsLoading(false);
    }, 1000);
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-slate-600 mt-2">
              Here's what's happening with your chatbots today.
            </p>
          </div>
          <Link href="/bots">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="h-4 w-4" />
              New Bot
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Bots"
            value={stats.totalBots}
            description="Deployed chatbots"
            icon={<Bot className="h-4 w-4" />}
            loading={isLoading}
          />
          <StatCard
            title="Conversations"
            value={stats.totalConversations}
            description="This month"
            icon={<MessageSquare className="h-4 w-4" />}
            loading={isLoading}
          />
          <StatCard
            title="Messages"
            value={stats.totalMessages.toLocaleString()}
            description="Total exchanges"
            icon={<TrendingUp className="h-4 w-4" />}
            loading={isLoading}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            description="Last 7 days"
            icon={<Users className="h-4 w-4" />}
            loading={isLoading}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Start */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Build your first AI chatbot in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    title: 'Create a new bot',
                    description: 'Set up your chatbot with custom parameters',
                    href: '/bots',
                  },
                  {
                    title: 'Upload documents',
                    description: 'Add knowledge base for RAG capabilities',
                    href: '/bots',
                  },
                  {
                    title: 'Deploy widget',
                    description: 'Get embed code for your website',
                    href: '/bots',
                  },
                  {
                    title: 'Monitor analytics',
                    description: 'Track conversations and performance',
                    href: '/dashboard',
                  },
                ].map((item, i) => (
                  <Link key={i} href={item.href}>
                    <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                      <h3 className="font-medium text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Created bot', time: '2 hours ago' },
                  { action: 'Uploaded documents', time: '5 hours ago' },
                  { action: 'Started conversation', time: '1 day ago' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-slate-600">{item.action}</span>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
