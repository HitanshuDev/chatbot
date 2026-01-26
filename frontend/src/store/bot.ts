import { create } from "zustand";
import { Bot } from "@/types";
import { useAuthStore } from "./auth";

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

export const useBotStore = create<BotStore>((set, get) => ({
  bots: [],
  activeBot: null,
  isLoading: false,
  error: null,

  setActiveBot: (bot) => set({ activeBot: bot }),

  fetchBots: async () => {
    try {
      set({ isLoading: true, error: null });

      const token = useAuthStore.getState().token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch bots");

      const data = await res.json();

      set({ bots: data.bots });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createBot: async (botData) => {
    try {
      set({ isLoading: true, error: null });

      const token = useAuthStore.getState().token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(botData),
      });

      if (!res.ok) throw new Error("Failed to create bot");

      const data = await res.json();

      set((state) => ({
        bots: [...state.bots, data.bot],
        activeBot: data.bot,
      }));
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateBot: async (botId, updateData) => {
    try {
      set({ isLoading: true, error: null });

      const token = useAuthStore.getState().token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!res.ok) throw new Error("Failed to update bot");

      const data = await res.json();

      set((state) => ({
        bots: state.bots.map((b) => (b.id === botId ? data.bot : b)),
        activeBot: state.activeBot?.id === botId ? data.bot : state.activeBot,
      }));
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBot: async (botId) => {
    try {
      set({ isLoading: true, error: null });

      const token = useAuthStore.getState().token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to delete bot");

      set((state) => ({
        bots: state.bots.filter((b) => b.id !== botId),
        activeBot: state.activeBot?.id === botId ? null : state.activeBot,
      }));
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
