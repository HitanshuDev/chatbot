'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Bot as BotIcon, MessageSquare, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Validated against the white card surface: OKLCH lightness band, chroma floor
// and 3:1 contrast all pass. See dataviz palette, categorical slot 1.
const SERIES_1 = '#2a78d6';

interface BotUsageRow {
  botId: string;
  name: string;
  totalConversations: number;
  totalMessages: number;
  weekConversations: number;
  weekMessages: number;
  avgMessagesPerConversation: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [rows, setRows] = useState<BotUsageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    useAuthStore.getState().hydrate();

    if (!useAuthStore.getState().user) {
      router.push('/auth/login');
      return;
    }

    (async () => {
      try {
        const botsRes = await apiClient.getBots();
        const bots = botsRes.bots ?? [];

        const usage = await Promise.all(
          bots.map(async (bot: any) => {
            try {
              const res = await apiClient.getUsage(bot._id);
              const u = res.usage ?? {};
              return {
                botId: bot._id,
                name: bot.name,
                totalConversations: u.totalConversations ?? 0,
                totalMessages: u.totalMessages ?? 0,
                weekConversations: u.weekConversations ?? 0,
                weekMessages: u.weekMessages ?? 0,
                avgMessagesPerConversation: u.avgMessagesPerConversation ?? 0,
              };
            } catch {
              // One bot failing shouldn't blank the whole page.
              return {
                botId: bot._id,
                name: bot.name,
                totalConversations: 0,
                totalMessages: 0,
                weekConversations: 0,
                weekMessages: 0,
                avgMessagesPerConversation: 0,
              };
            }
          })
        );

        setRows(usage);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router]);

  if (!user) return null;

  const totals = rows.reduce(
    (acc, r) => ({
      conversations: acc.conversations + r.totalConversations,
      messages: acc.messages + r.totalMessages,
      weekMessages: acc.weekMessages + r.weekMessages,
    }),
    { conversations: 0, messages: 0, weekMessages: 0 }
  );

  const chartRows = [...rows].sort((a, b) => b.totalMessages - a.totalMessages);
  const maxMessages = Math.max(...chartRows.map((r) => r.totalMessages), 1);

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">
            Usage across all of your bots
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total bots"
            value={rows.length}
            icon={<BotIcon className="h-4 w-4" />}
            loading={isLoading}
          />
          <StatCard
            title="Conversations"
            value={totals.conversations}
            icon={<Users className="h-4 w-4" />}
            loading={isLoading}
          />
          <StatCard
            title="Messages"
            value={totals.messages}
            icon={<MessageSquare className="h-4 w-4" />}
            loading={isLoading}
          />
          <StatCard
            title="Messages, last 7 days"
            value={totals.weekMessages}
            icon={<MessageSquare className="h-4 w-4" />}
            loading={isLoading}
          />
        </div>

        {!isLoading && rows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BotIcon className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 mb-4">
                No bots yet, so there is nothing to measure.
              </p>
              <Link href="/bots">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create a bot
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Messages per bot</CardTitle>
                <CardDescription>
                  Total messages exchanged, highest first
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  // Single series, so no legend: the card title names it. Values
                  // are direct-labelled, and the table below is the table view.
                  <div className="flex flex-col gap-[2px]">
                    {chartRows.map((r) => (
                      <div key={r.botId} className="flex items-center gap-3 py-1">
                        <div className="w-40 shrink-0 truncate text-sm text-slate-600" title={r.name}>
                          {r.name}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div
                            className="h-4 transition-[width]"
                            style={{
                              width: `${(r.totalMessages / maxMessages) * 100}%`,
                              minWidth: r.totalMessages > 0 ? 2 : 0,
                              backgroundColor: SERIES_1,
                              borderRadius: '0 4px 4px 0',
                            }}
                            title={`${r.name}: ${r.totalMessages} messages`}
                          />
                          <span className="text-sm font-medium text-slate-900 tabular-nums">
                            {r.totalMessages}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Per-bot breakdown</CardTitle>
                <CardDescription>All-time totals, with the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bot</TableHead>
                      <TableHead className="text-right">Conversations</TableHead>
                      <TableHead className="text-right">Messages</TableHead>
                      <TableHead className="text-right">Avg / conversation</TableHead>
                      <TableHead className="text-right">Msgs (7d)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartRows.map((r) => (
                      <TableRow key={r.botId}>
                        <TableCell className="font-medium">
                          <Link href={`/bots/${r.botId}`} className="hover:underline">
                            {r.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {r.totalConversations}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {r.totalMessages}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {r.avgMessagesPerConversation.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {r.weekMessages}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
