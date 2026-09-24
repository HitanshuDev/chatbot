import { create } from 'zustand';
import { User } from '@/types';

const USER_KEY = 'user';
const TOKEN_KEY = 'token';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  hydrated: false,

  setUser: (user) => {
    set({ user });
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    }
  },
  setToken: (token) => {
    set({ token });
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  logout: () => {
    set({ user: null, token: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    // Must run at most once. Callers invoke this from effects that depend on
    // `user`, and re-parsing the stored JSON would yield a fresh object
    // reference each time, re-triggering those effects forever.
    if (get().hydrated) return;

    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    let user: User | null = null;
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }

    // A user without a token is unusable, so require both. Single set() so
    // subscribers re-render once.
    set(
      token && user
        ? { token, user, hydrated: true }
        : { token: token ?? null, hydrated: true },
    );
  },
}));
