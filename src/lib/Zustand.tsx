// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import jwt from "jsonwebtoken";

// interface ThemeColors {
//   topBarColor: string;
//   sidebarColor: string;
//   sidebarBackground: string;
//   primary: string;
//   primaryForeground: string;
//   secondary: string;
//   secondaryForeground: string;
// }

// interface AuthState {
//   userId: string | null;
//   role: string | null;
//   exp: number | null;
//   isAuthenticated: boolean;
//   sessionId: string | null;
//   login: (accessToken: string, refreshToken: string, sessionId: string) => void;
//   logout: () => void;
//   checkAuth: () => void;
// }

// interface StoreState extends AuthState {
//   themeColors: ThemeColors;
//   updateThemeColor: (key: keyof ThemeColors, value: string) => void;
//   resetTheme: () => void;
// }

// const useStore = create<StoreState>()(
//   persist(
//     (set) => ({
//       // 🔹 Auth State
//       userId: null,
//       role: null,
//       exp: null,
//       isAuthenticated: false,
//       sessionId: null,

//       login: (accessToken: string, refreshToken: string, sessionId: string) => {
//         try {
//           const decoded: any = jwt.decode(accessToken);
//           console.log(decoded)
//           if (decoded?.uid && decoded?.rid) {
//             set({
//               userId: decoded.uid,
//               role: decoded.rid,
//               exp: decoded.exp,
//               isAuthenticated: true,
//               sessionId: sessionId,
//             });
//             localStorage.setItem("token", accessToken);
//             localStorage.setItem("refreshToken", refreshToken);
//             localStorage.setItem("sessionId", sessionId);
//           }
//         } catch (err) {
//           console.error("JWT decode error:", err);
//         }
//       },

//       logout: () => {
//         set({ userId: null, role: null, exp: null, isAuthenticated: false, sessionId: null });
//         localStorage.removeItem("token");
//         localStorage.removeItem("refreshToken");
//         localStorage.removeItem("sessionId");
//       },

//       checkAuth: () => {
//         if (typeof window === "undefined") return;

//         const token = localStorage.getItem("token");
//         const sessionId = localStorage.getItem("sessionId");
        
//         if (token) {
//           try {
//             const decoded: any = jwt.decode(token);
//             if (decoded?.uid && decoded?.rid && decoded?.exp) {
//               // Check if token is expired
//               const currentTime = Date.now() / 1000;
//               if (decoded.exp > currentTime) {
//                 // Token is still valid
//                 set({
//                   userId: decoded.uid,
//                   role: decoded.rid,
//                   exp: decoded.exp,
//                   isAuthenticated: true,
//                   sessionId: sessionId,
//                 });
//                 console.log("User authenticated with valid token");
//               } else {
//                 // Token is expired, clear everything
//                 console.log("Token expired, clearing authentication");
//                 set({ userId: null, role: null, exp: null, isAuthenticated: false, sessionId: null });
//                 localStorage.removeItem("token");
//                 localStorage.removeItem("refreshToken");
//                 localStorage.removeItem("sessionId");
//                 localStorage.removeItem("id");
//               }
//             } else {
//               // Invalid token structure
//               console.log("Invalid token structure");
//               set({ userId: null, role: null, exp: null, isAuthenticated: false, sessionId: null });
//               localStorage.removeItem("token");
//               localStorage.removeItem("refreshToken");
//               localStorage.removeItem("sessionId");
//               localStorage.removeItem("id");
//             }
//           } catch {
//             // JWT decode error
//             console.log("JWT decode error");
//             set({ userId: null, role: null, exp: null, isAuthenticated: false, sessionId: null });
//             localStorage.removeItem("token");
//             localStorage.removeItem("refreshToken");
//             localStorage.removeItem("sessionId");
//             localStorage.removeItem("id");
//           }
//         } else {
//           // No token found
//           console.log("No token found");
//           set({ userId: null, role: null, exp: null, isAuthenticated: false, sessionId: null });
//         }
//       },

//       // 🔹 Theme Colors
//       themeColors: {
//         topBarColor: "",
//         sidebarColor: "",
//         sidebarBackground: "",
//         primary: "240 5.9% 10%",
//         primaryForeground: "0 0% 98%",
//         secondary: "240 4.8% 95.9%",
//         secondaryForeground: "240 5.9% 10%",
//       },

//       updateThemeColor: (key, value) =>
//         set((state) => ({
//           themeColors: {
//             ...state.themeColors,
//             [key]: value,
//           },
//         })),

//       resetTheme: () =>
//         set(() => ({
//           themeColors: {
//             topBarColor: "",
//             sidebarColor: "",
//             sidebarBackground: "",
//             primary: "240 5.9% 10%",
//             primaryForeground: "0 0% 98%",
//             secondary: "240 4.8% 95.9%",
//             secondaryForeground: "240 5.9% 10%",
//           },
//         })),
//     }),
//     {
//       name: "app-store", // Local storage key
//     }
//   )
// );

// export default useStore;

import { create } from "zustand";
import { persist } from "zustand/middleware";
import jwt from "jsonwebtoken";

// 🎨 Theme type
interface ThemeColors {
  topBarColor: string;
  sidebarColor: string;
  sidebarBackground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
}

// 🔐 Auth type
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

// 🔁 Combined store
interface StoreState extends AuthState {
  themeColors: ThemeColors;
  updateThemeColor: (key: keyof ThemeColors, value: string) => void;
  resetTheme: () => void;
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // ➤ Auth state
      userId: null,
      role: null,
      exp: null,
      isAuthenticated: false,
      sessionId: null,

      login: (accessToken, refreshToken, sessionId) => {
        try {
          const decoded: any = jwt.decode(accessToken);
       if (decoded?.uid && decoded?.rid && decoded?.exp) {
            set({
              userId: decoded.uid,
              role: decoded.rid,
              exp: decoded.exp,
              isAuthenticated: true,
              sessionId,
            });
            // 👉 Use sessionStorage (per-tab isolation)
            sessionStorage.setItem("token", accessToken);
            sessionStorage.setItem("refreshToken", refreshToken);
            sessionStorage.setItem("sessionId", sessionId);
          }
        } catch (err) {
          console.error("JWT decode error:", err);
        }
      },

      logout: () => {
        set({
          userId: null,
          role: null,
          exp: null,
          isAuthenticated: false,
          sessionId: null,
        });
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("sessionId");
      },

      checkAuth: () => {
        if (typeof window === "undefined") return;

        const token = sessionStorage.getItem("token");
        const sessionId = sessionStorage.getItem("sessionId");

        if (token) {
          try {
            const decoded: any = jwt.decode(token);
           if (decoded?.uid && decoded?.rid && decoded?.exp) {
              const currentTime = Date.now() / 1000;
              if (decoded.exp > currentTime) {
                set({
                  userId: decoded.uid,
                  role: decoded.rid,
                  exp: decoded.exp,
                  isAuthenticated: true,
                  sessionId,
                });
                console.log("User authenticated");
              } else {
                console.log("Token expired");
                set({
                  userId: null,
                  role: null,
                  exp: null,
                  isAuthenticated: false,
                  sessionId: null,
                });
                sessionStorage.clear();
              }
            } else {
              console.log("Invalid token structure");
              set({
                userId: null,
                role: null,
                exp: null,
                isAuthenticated: false,
                sessionId: null,
              });
              sessionStorage.clear();
            }
          } catch {
            console.log("JWT decode error");
            set({
              userId: null,
              role: null,
              exp: null,
              isAuthenticated: false,
              sessionId: null,
            });
            sessionStorage.clear();
          }
        } else {
          console.log("No token found");
          set({
            userId: null,
            role: null,
            exp: null,
            isAuthenticated: false,
            sessionId: null,
          });
        }
      },

      // 🎨 Theme state (stored in localStorage)
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
      name: "theme-store", // Only theme is persisted in localStorage
      partialize: (state) => ({ themeColors: state.themeColors }), // Only persist theme
    }
  )
);

export default useStore;

