import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthProfile {
  id?: string;
  user_id?: string;
  role?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  [key: string]: unknown;
}

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  role: string | null;
  profile: AuthProfile | null;
}

export interface ActiveProjectState {
  id: string | null;
  data: Record<string, unknown> | null;
}

export interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  description?: string;
}

export interface UIState {
  theme: "light" | "dark" | "system";
  loading: boolean;
  toasts: ToastItem[];
}

interface AppStore {
  auth: AuthState;
  activeProject: ActiveProjectState;
  ui: UIState;
  setAuth: (payload: Partial<AuthState>) => void;
  clearAuth: () => void;
  setActiveProject: (project: Partial<ActiveProjectState> | null) => void;
  setUILoading: (loading: boolean) => void;
  setTheme: (theme: UIState["theme"]) => void;
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const initialAuth: AuthState = {
  isAuthenticated: false,
  userId: null,
  role: null,
  profile: null,
};

const initialProject: ActiveProjectState = { id: null, data: null };

const initialUI: UIState = { theme: "system", loading: false, toasts: [] };

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      auth: initialAuth,
      activeProject: initialProject,
      ui: initialUI,
      setAuth: (payload) =>
        set((state) => ({ auth: { ...state.auth, ...payload, isAuthenticated: payload.userId ? true : payload.isAuthenticated ?? state.auth.isAuthenticated } })),
      clearAuth: () => set({ auth: initialAuth, activeProject: initialProject }),
      setActiveProject: (project) =>
        set((state) => ({
          activeProject: project ? { ...state.activeProject, ...project } : initialProject,
        })),
      setUILoading: (loading) => set((state) => ({ ui: { ...state.ui, loading } })),
      setTheme: (theme) => set((state) => ({ ui: { ...state.ui, theme } })),
      pushToast: (toast) =>
        set((state) => ({
          ui: {
            ...state.ui,
            toasts: [...state.ui.toasts, { ...toast, id: crypto.randomUUID() }],
          },
        })),
      removeToast: (id) =>
        set((state) => ({
          ui: { ...state.ui, toasts: state.ui.toasts.filter((t) => t.id !== id) },
        })),
    }),
    {
      name: "buildverse-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        auth: {
          isAuthenticated: state.auth.isAuthenticated,
          userId: state.auth.userId,
          role: state.auth.role,
          profile: state.auth.profile,
        },
        activeProject: state.activeProject,
        ui: { theme: state.ui.theme, loading: false, toasts: [] },
      }),
    }
  )
);

export const selectAuth = (s: AppStore) => s.auth;
export const selectUI = (s: AppStore) => s.ui;
export const selectActiveProject = (s: AppStore) => s.activeProject;
