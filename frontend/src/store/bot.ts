import { create } from "zustand";
import { Bot } from "@/types";
import { apiClient } from "@/lib/api";

interface BotStore {
  bots: Bot[];
  activeBot: Bot | null;
  isLoading: boolean;
  error: string | null;

  fetchBots: () => Promise<void>;
  createBot: (data: Partial<Bot>) => Promise<void>;
  updateBot: (botId: string, data: Partial<Bot>) => Promise<void>;
  deleteBot: (botId: string) => Promise<void>;
  setActiveBot: (bot: Bot | null) => void;
}

export const useBotStore = create<BotStore>((set) => ({
  bots: [],
  activeBot: null,
  isLoading: false,
  error: null,

  setActiveBot: (bot) => set({ activeBot: bot }),

  fetchBots: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.getBots();
      
      set({ bots: data.bots });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch bots" });
    } finally {
      set({ isLoading: false });
    }
  },

  createBot: async (botData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.createBot(botData);
      set((state) => ({
        bots: [...state.bots, data.bot],
        activeBot: data.bot,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to create bot" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateBot: async (botId, updateData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.updateBot(botId, updateData);
      set((state) => ({
        bots: state.bots.map((b) => (b.id === botId ? data.bot : b)),
        activeBot: state.activeBot?._id === botId ? data.bot : state.activeBot,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to update bot" });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBot: async (botId) => {
    try {
      set({ isLoading: true, error: null });
      await apiClient.deleteBot(botId);
      set((state) => ({
        bots: state.bots.filter((b) => b._id !== botId),
        activeBot: state.activeBot?._id === botId ? null : state.activeBot,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to delete bot" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
