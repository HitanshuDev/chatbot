"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Sparkles, Zap } from "lucide-react";
import { useBotStore } from "@/store/bot";
import { toast } from "sonner";

interface CreateBotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBotDialog({ open, onOpenChange }: CreateBotDialogProps) {
  const { createBot, isLoading } = useBotStore();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    avatar: "",
    theme: "light",
    initialPrompt: "You are a helpful assistant.",
    temperature: 0.7,
    maxTokens: 500,
    model: "gpt-3.5-turbo",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a bot name");
      return;
    }

    try {
      await createBot(formData);
      toast.success("Bot created successfully!");
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        description: "",
        avatar: "",
        theme: "light",
        initialPrompt: "You are a helpful assistant.",
        temperature: 0.7,
        maxTokens: 500,
        model: "gpt-3.5-turbo",
      });
    } catch (error) {
      toast.error("Failed to create bot");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="rounded-full bg-blue-100 p-2">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            Create New Bot
          </DialogTitle>
          <DialogDescription>
            Configure your chatbot's personality, behavior, and capabilities
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Basic Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name">Bot Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Customer Support Bot"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Describe what your bot does..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={formData.theme}
                  onChange={(e) =>
                    setFormData({ ...formData, theme: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              AI Configuration
            </h3>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <select
                id="model"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialPrompt">Initial System Prompt</Label>
              <textarea
                id="initialPrompt"
                placeholder="Define your bot's personality and behavior..."
                value={formData.initialPrompt}
                onChange={(e) =>
                  setFormData({ ...formData, initialPrompt: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500">
                This prompt sets the bot's personality and instructions
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature</Label>
                <span className="text-sm font-medium text-slate-700">
                  {formData.temperature.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                id="temperature"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Focused</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <span className="text-sm font-medium text-slate-700">
                  {formData.maxTokens}
                </span>
              </div>
              <input
                type="range"
                id="maxTokens"
                min="100"
                max="4000"
                step="100"
                value={formData.maxTokens}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxTokens: parseInt(e.target.value),
                  })
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-slate-500">
                Maximum length of bot responses
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Bot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
