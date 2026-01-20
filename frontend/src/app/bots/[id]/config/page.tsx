'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function BotConfigPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.id as string;
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialPrompt: '',
    temperature: 0.7,
    maxTokens: 2000,
    model: 'gpt-4',
  });

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Simulate loading bot config
    setTimeout(() => {
      setFormData({
        name: 'Customer Support Bot',
        description: 'Handles customer inquiries and support tickets',
        initialPrompt: 'You are a helpful customer support agent for our company. Always be professional and empathetic.',
        temperature: 0.7,
        maxTokens: 2000,
        model: 'gpt-4',
      });
      setIsLoading(false);
    }, 500);
  }, [user, router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/bots/${botId}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bot Configuration</h1>
            <p className="text-slate-600 mt-1">
              Customize your bot's behavior and settings
            </p>
          </div>
        </div>

        {/* Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Changes to the initial prompt and model parameters will apply to new conversations.
          </AlertDescription>
        </Alert>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Name and description of your chatbot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Customer Support Bot"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="What does this bot do?"
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Behavior */}
        <Card>
          <CardHeader>
            <CardTitle>Behavior Configuration</CardTitle>
            <CardDescription>
              Control how your bot responds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initialPrompt">Initial System Prompt</Label>
              <textarea
                id="initialPrompt"
                value={formData.initialPrompt}
                onChange={(e) => handleInputChange('initialPrompt', e.target.value)}
                placeholder="Enter system prompt..."
                className="w-full h-32 px-3 py-2 border rounded-lg text-sm font-mono"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500">
                This sets the personality and context for your bot
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <select
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  disabled={isLoading}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">
                  Temperature: {formData.temperature.toFixed(2)}
                </Label>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  className="w-full"
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500">
                  Lower = more focused, Higher = more creative
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                  min="100"
                  max="4000"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
          <Link href={`/bots/${botId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
