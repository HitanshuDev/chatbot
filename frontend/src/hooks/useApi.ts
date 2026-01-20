import { useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export function useApiCall<T>() {
  const execute = useCallback(
    async (
      apiFunction: () => Promise<T>,
      onSuccess?: (data: T) => void,
      onError?: (error: any) => void
    ) => {
      try {
        const data = await apiFunction();
        onSuccess?.(data);
        return data;
      } catch (error: any) {
        const message = error?.message || 'An error occurred';
        toast.error(message);
        onError?.(error);
        throw error;
      }
    },
    []
  );

  return { execute };
}

// Hook for fetching bots
export function useBots() {
  const getBots = useCallback(async () => {
    return apiClient.getBots();
  }, []);

  return { getBots };
}

// Hook for fetching bot details
export function useBot(botId: string) {
  const getBot = useCallback(async () => {
    return apiClient.getBot(botId);
  }, [botId]);

  return { getBot };
}

// Hook for conversations
export function useConversations(botId: string) {
  const getConversations = useCallback(async () => {
    return apiClient.getConversations(botId);
  }, [botId]);

  return { getConversations };
}

// Hook for sending messages
export function useMessages(conversationId: string) {
  const sendMessage = useCallback(
    async (content: string) => {
      return apiClient.sendMessage(conversationId, content);
    },
    [conversationId]
  );

  return { sendMessage };
}
