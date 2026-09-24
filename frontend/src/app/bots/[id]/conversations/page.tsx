'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Upload, MessageSquare, FileIcon, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Conversation, Upload as UploadFile } from '@/types';

const POLL_INTERVAL_MS = 2000;

export default function BotConversationsPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.id as string;
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUploads = useCallback(async () => {
    const res = await apiClient.getUploads(botId);
    setUploads(res.uploads ?? []);
    return (res.uploads ?? []) as UploadFile[];
  }, [botId]);

  const loadConversations = useCallback(async () => {
    const res = await apiClient.getConversations(botId);
    setConversations(
      (res.conversations ?? []).map((c: any) => ({ ...c, id: c._id ?? c.id }))
    );
  }, [botId]);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!useAuthStore.getState().user) {
      router.push('/auth/login');
      return;
    }

    (async () => {
      try {
        await Promise.all([loadUploads(), loadConversations()]);
      } catch {
        toast.error('Failed to load bot data');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [botId, router, loadUploads, loadConversations]);

  // Poll while any upload is still being processed by the queue worker.
  useEffect(() => {
    const isPending = uploads.some(
      (u) => u.status === 'pending' || u.status === 'processing'
    );
    if (!isPending) return;

    const timer = setInterval(() => {
      loadUploads().catch(() => {});
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [uploads, loadUploads]);

  const handleDeleteUpload = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await apiClient.deleteUpload(botId, uploadId);
      setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      toast.success('File deleted');
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await apiClient.uploadDocument(botId, file);
      toast.success(`${file.name} queued for processing`);
      await loadUploads();
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  const statusLabel = (upload: UploadFile) => {
    if (upload.status === 'completed') {
      return <span className="text-xs font-medium text-green-600">Completed</span>;
    }
    if (upload.status === 'failed') {
      return (
        <span className="text-xs font-medium text-red-600" title={upload.error}>
          Failed
        </span>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
        <span className="text-xs font-medium text-blue-600">
          {upload.status === 'pending' ? 'Queued...' : 'Processing...'}
        </span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        <div className="flex items-center gap-4">
          <Link href={`/bots/${botId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bot Management</h1>
            <p className="text-slate-600 mt-1">
              Manage conversations and uploaded documents
            </p>
          </div>
        </div>

        <Tabs defaultValue="uploads" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="uploads" className="gap-2">
              <Upload className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="conversations" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploads" className="space-y-4">
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-slate-400 mb-2 animate-spin" />
                        <p className="text-sm text-slate-600">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">PDF or TXT up to 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.md"
                    disabled={isUploading}
                  />
                </label>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {isLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </CardContent>
                </Card>
              ) : uploads.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileIcon className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">No documents uploaded yet</p>
                  </CardContent>
                </Card>
              ) : (
                uploads.map((upload) => (
                  <Card key={upload.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3 flex-1">
                        <FileIcon className="h-8 w-8 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">
                            {upload.fileName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(upload.fileSize / 1024 / 1024).toFixed(2)} MB
                            {upload.embeddingCount > 0 &&
                              ` • ${upload.embeddingCount} embeddings`}
                            {upload.status === 'failed' && upload.error && ` • ${upload.error}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">{statusLabel(upload)}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUpload(upload.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </CardContent>
              </Card>
            ) : conversations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">No conversations yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Card key={conv.id} className="hover:shadow-md transition-all">
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {conv.title || 'Untitled Conversation'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(conv.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Link href={`/bots/${botId}/conversations/${conv.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
