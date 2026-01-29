'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/types';
import { Send, Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatUIProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChatUI({ messages, onSendMessage, isLoading }: ChatUIProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const message = input.trim();
    setInput('');
    setIsSending(true);

    try {
      await onSendMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-3/4 rounded-lg" />
                <Skeleton className="h-12 w-1/2 rounded-lg" />
              </div>
            ))
          : messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.metadata && (
                    <div className="mt-2 space-y-1 text-xs opacity-75">
                      {msg.metadata.confidence && (
                        <p>Confidence: {(msg.metadata.confidence * 100).toFixed(0)}%</p>
                      )}
                      {msg.metadata.sources && msg.metadata.sources.length > 0 && (
                        <p>Sources: {msg.metadata.sources.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isSending}
          />
          <Button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
