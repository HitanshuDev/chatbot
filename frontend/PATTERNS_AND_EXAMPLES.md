# 📖 Common Patterns & Code Examples

## Authentication Examples

### Using Auth Store in Components
```typescript
'use client';

import { useAuthStore } from '@/store/auth';

export function MyComponent() {
  const { user, token, logout } = useAuthStore();

  if (!user) {
    return <div>Please login</div>;
  }

  return <div>Hello {user.name}</div>;
}
```

### Protected Route Hook
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';

export function useProtectedRoute() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);
}
```

---

## API Integration Examples

### Fetching Data
```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Bot } from '@/types';
import { toast } from 'sonner';

export function BotList() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const data = await apiClient.getBots();
        setBots(data);
      } catch (error) {
        toast.error('Failed to load bots');
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, []);

  return (
    <div>
      {loading ? 'Loading...' : bots.map(bot => <div key={bot.id}>{bot.name}</div>)}
    </div>
  );
}
```

### Creating Data
```typescript
const handleCreateBot = async (formData: any) => {
  try {
    const newBot = await apiClient.createBot(formData);
    toast.success('Bot created successfully');
    // Refresh bot list or update state
  } catch (error) {
    toast.error('Failed to create bot');
  }
};
```

### Updating Data
```typescript
const handleUpdateBot = async (botId: string, updates: any) => {
  try {
    const updated = await apiClient.updateBot(botId, updates);
    toast.success('Bot updated successfully');
  } catch (error) {
    toast.error('Failed to update bot');
  }
};
```

### Deleting Data
```typescript
const handleDeleteBot = async (botId: string) => {
  if (confirm('Are you sure?')) {
    try {
      await apiClient.deleteBot(botId);
      toast.success('Bot deleted successfully');
    } catch (error) {
      toast.error('Failed to delete bot');
    }
  }
};
```

---

## Form Handling Examples

### Simple Form
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function BotForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // API call here
      toast.success('Form submitted');
    } catch (error) {
      toast.error('Form submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Bot Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

---

## Component Examples

### Using Chat UI
```typescript
import { ChatUI } from '@/components/dashboard/chat-ui';
import { Message } from '@/types';
import { useState } from 'react';

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'user',
      content,
      tokens: 0,
      // ... other fields
    }]);

    // Get bot response
    try {
      const response = await apiClient.sendMessage(conversationId, content);
      setMessages(prev => [...prev, {
        id: response.id,
        sender: 'bot',
        content: response.content,
        tokens: response.tokens,
      }]);
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return <ChatUI messages={messages} onSendMessage={handleSendMessage} />;
}
```

### Using Stat Card
```typescript
import { StatCard } from '@/components/dashboard/stat-card';
import { Users, MessageSquare } from 'lucide-react';

export function StatsSection() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="Total Users"
        value="1,234"
        description="This month"
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Messages"
        value="5,678"
        description="Total sent"
        icon={<MessageSquare className="h-4 w-4" />}
      />
    </div>
  );
}
```

---

## Layout Usage

### Using Dashboard Layout
```typescript
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function MyPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Your content here */}
      </div>
    </DashboardLayout>
  );
}
```

---

## Navigation Examples

### Link Navigation
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function NavigationExample() {
  return (
    <Link href="/bots/123/config">
      <Button>Edit Bot</Button>
    </Link>
  );
}
```

### Programmatic Navigation
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function GoBackButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()}>
      Go Back
    </Button>
  );
}
```

---

## File Upload Examples

### Drag and Drop Upload
```typescript
'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

export function FileUpload({ botId }: { botId: string }) {
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    for (let file of files) {
      try {
        await apiClient.uploadDocument(botId, file);
        toast.success(`${file.name} uploaded`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }, [botId]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed rounded-lg p-8"
    >
      Drop files here
    </div>
  );
}
```

---

## State Management Examples

### Auth Store Usage
```typescript
import { useAuthStore } from '@/store/auth';

// Get state
const { user, token } = useAuthStore();

// Update user
useAuthStore.getState().setUser(newUser);

// Update token
useAuthStore.getState().setToken(newToken);

// Logout
useAuthStore.getState().logout();

// Hydrate from localStorage
useAuthStore.getState().hydrate();
```

---

## Error Handling Examples

### API Error Handling
```typescript
try {
  const data = await apiClient.getBots();
  // Handle success
} catch (error: any) {
  console.error('Error:', error.message);
  console.error('Status:', error.statusCode);
  console.error('Code:', error.code);
  toast.error(error.message);
}
```

### Form Error Handling
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});

  try {
    await apiClient.createBot(formData);
  } catch (error: any) {
    if (error.statusCode === 422) {
      // Validation errors
      setErrors(error.validation);
    } else {
      toast.error(error.message);
    }
  }
};

return (
  <div>
    {errors.name && <p className="text-red-500">{errors.name}</p>}
  </div>
);
```

---

## Loading States Examples

### Loading Skeleton
```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function BotCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-10 w-20" />
    </div>
  );
}
```

### Loading Spinner
```typescript
import { Loader } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <Loader className="h-6 w-6 animate-spin" />
    </div>
  );
}
```

---

## Modal Examples

### Using Dialog
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function MyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description here</DialogDescription>
        </DialogHeader>
        <div>Dialog content here</div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Utility Functions Examples

### Copy to Clipboard
```typescript
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  } catch (error) {
    toast.error('Failed to copy');
  }
};
```

### Format Date
```typescript
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
```

### Format Bytes
```typescript
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
```

---

## Tips & Best Practices

### 1. Always Hydrate Auth on Load
```typescript
useEffect(() => {
  useAuthStore.getState().hydrate();
}, []);
```

### 2. Use Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    // API call
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Handle Errors Gracefully
```typescript
try {
  // API call
} catch (error) {
  toast.error('Something went wrong');
  console.error(error);
}
```

### 4. Optimize Re-renders
```typescript
const memoizedValue = useMemo(() => expensiveCalculation(), [dependency]);
const memoizedCallback = useCallback(() => {}, []);
```

### 5. Use TypeScript Types
```typescript
const myFunction = (bot: Bot, user: User): Promise<Conversation> => {
  // Implementation
};
```

---

## Common Tasks

### Add a New Page
1. Create file in `src/app/`
2. Wrap with `DashboardLayout`
3. Use `useProtectedRoute()` if needed
4. Import components

### Add API Endpoint Call
1. Add method to `src/lib/api.ts`
2. Create hook in `src/hooks/useApi.ts`
3. Use in component
4. Handle errors with toast

### Create New Component
1. Create file in `src/components/`
2. Use shadcn/ui as building blocks
3. Accept props with TypeScript types
4. Export component

### Update Auth State
1. Import `useAuthStore`
2. Call setter functions
3. Use getState() for synchronous access
4. Token auto-saved to localStorage

---

Happy coding! 🚀
