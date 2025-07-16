import { create } from "zustand";
import { persist } from "zustand/middleware";
import jwt from "jsonwebtoken";

interface ThemeColors {
  topBarColor: string;
  sidebarColor: string;
  sidebarBackground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
}

interface AuthState {
  userId: string | null;
  role: string | null;
  exp: number | null;
  isAuthenticated: boolean;
  sessionId: string | null;
  login: (accessToken: string, refreshToken: string, sessionId: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

interface StoreState extends AuthState {
  themeColors: ThemeColors;
  updateThemeColor: (key: keyof ThemeColors, value: string) => void;
  resetTheme: () => void;
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // 🔹 Auth State
      userId: null,
      role: null,
      exp: null,
      isAuthenticated: false,
      sessionId: null,

      login: (accessToken: string, refreshToken: string, sessionId: string) => {
        try {
          const decoded: any = jwt.decode(accessToken);
          console.log(decoded)
          if (decoded?.uid && decoded?.rid) {
            set({
              userId: decoded.uid,
              role: decoded.rid,
              exp: decoded.exp,
              isAuthenticated: true,
              sessionId: sessionId,
            });
            localStorage.setItem("token", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("sessionId", sessionId);
          }
        } catch (err) {
          console.error("JWT decode error:", err);
        }
      },

      logout: () => {
        set({ userId: null, role: null, exp: null, isAuthenticated: false, sessionId: null });
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("sessionId");
      },

      checkAuth: () => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");
        const sessionId = localStorage.getItem("sessionId");
        
        if (token) {
          try {
            const decoded: any = jwt.decode(token);
            if (decoded?.uid && decoded?.rid) {
              set({
                userId: decoded.uid,
                role: decoded.rid,
                exp: decoded.exp,
                isAuthenticated: true,
                sessionId: sessionId,
              });
            } else {
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("sessionId");
            }
          } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("sessionId");
          }
        }
      },

      // 🔹 Theme Colors
      themeColors: {
        topBarColor: "",
        sidebarColor: "",
        sidebarBackground: "",
        primary: "240 5.9% 10%",
        primaryForeground: "0 0% 98%",
        secondary: "240 4.8% 95.9%",
        secondaryForeground: "240 5.9% 10%",
      },

      updateThemeColor: (key, value) =>
        set((state) => ({
          themeColors: {
            ...state.themeColors,
            [key]: value,
          },
        })),

      resetTheme: () =>
        set(() => ({
          themeColors: {
            topBarColor: "",
            sidebarColor: "",
            sidebarBackground: "",
            primary: "240 5.9% 10%",
            primaryForeground: "0 0% 98%",
            secondary: "240 4.8% 95.9%",
            secondaryForeground: "240 5.9% 10%",
          },
        })),
    }),
    {
      name: "app-store", // Local storage key
    }
  )
);

export default useStore;
