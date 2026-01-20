'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { ArrowLeft, Upload, MessageSquare, FileIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Conversation, Message, Upload as UploadFile } from '@/types';

export default function BotConversationsPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.id as string;
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Simulate loading conversations and uploads
    setTimeout(() => {
      setConversations([
        {
          id: '1',
          botId: botId,
          userId: 'user1',
          title: 'Order Inquiry',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          botId: botId,
          userId: 'user2',
          title: 'Technical Support',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          botId: botId,
          userId: 'user3',
          title: 'Billing Question',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      setUploads([
        {
          id: '1',
          botId: botId,
          fileName: 'knowledge-base.pdf',
          fileSize: 5242880,
          uploadedAt: new Date(),
          status: 'completed',
          embeddingCount: 156,
        },
        {
          id: '2',
          botId: botId,
          fileName: 'faq.docx',
          fileSize: 1048576,
          uploadedAt: new Date(),
          status: 'processing',
          embeddingCount: 0,
        },
      ]);

      setIsLoading(false);
    }, 500);
  }, [botId, user, router]);

  const handleDeleteUpload = (uploadId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setUploads(uploads.filter((u) => u.id !== uploadId));
      toast.success('File deleted successfully');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create new upload
    const newUpload: UploadFile = {
      id: Date.now().toString(),
      botId: botId,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date(),
      status: 'processing',
      embeddingCount: 0,
    };

    setUploads([...uploads, newUpload]);
    toast.success(`Uploading ${file.name}...`);

    // Simulate processing
    setTimeout(() => {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === newUpload.id
            ? {
                ...u,
                status: 'completed',
                embeddingCount: Math.floor(Math.random() * 200) + 50,
              }
            : u
        )
      );
      toast.success(`${file.name} uploaded successfully`);
    }, 2000);
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
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

        {/* Tabs */}
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

          {/* Uploads Tab */}
          <TabsContent value="uploads" className="space-y-4">
            {/* Upload Area */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, DOCX, TXT up to 50MB
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt"
                  />
                </label>
              </CardContent>
            </Card>

            {/* Uploads List */}
            <div className="space-y-2">
              {uploads.length === 0 ? (
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
                            {(upload.fileSize / 1024 / 1024).toFixed(2)} MB •{' '}
                            {upload.embeddingCount > 0 && (
                              <>
                                {upload.embeddingCount} embeddings
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          {upload.status === 'processing' ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                              <span className="text-xs font-medium text-blue-600">
                                Processing...
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-green-600">
                              Completed
                            </span>
                          )}
                        </div>
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

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-4">
            {conversations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">No conversations yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <Card
                    key={conv.id}
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {conv.title || 'Untitled Conversation'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
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
