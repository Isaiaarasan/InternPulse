import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useThemeStore } from "./stores/themeStore";
import { useTheme } from "./hooks/useTheme";
import { useAuthStore } from "./stores/authStore";
import { socketService } from "./services/socketService";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemeStore();
  useTheme(); // Load custom colors from database

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return <>{children}</>;
}

export default function App() {
  const { isDark } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      // Don't disconnect on unmount, only on auth change
    };
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "14px",
              padding: "12px 16px",
              fontSize: "13px",
              fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
              fontWeight: "500",
              background: isDark ? "#1A1A2E" : "#FFFFFF",
              color: isDark ? "#F8F8FF" : "#1a1040",
              border: `1px solid ${isDark ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.15)"}`,
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.5)"
                : "0 8px 32px rgba(124,58,237,0.1)",
            },
            success: {
              iconTheme: {
                primary: "#06D6A0",
                secondary: isDark ? "#1A1A2E" : "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF233C",
                secondary: isDark ? "#1A1A2E" : "#fff",
              },
            },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  );
}
