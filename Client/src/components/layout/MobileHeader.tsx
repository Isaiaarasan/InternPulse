import { Link } from "react-router-dom";
import { Bell, Sparkles, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useNotifStore } from "../../stores/notifStore";
import { useChatStore } from "../../stores/chatStore";
import { useThemeStore } from "../../stores/themeStore";
import IconImage from "../../assets/IN.png";

interface MobileHeaderProps {
  title?: string;
}

export default function MobileHeader({ title = "InternPulse" }: MobileHeaderProps) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotifStore();
  const { open: openChat } = useChatStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();

  return (
    <header
      className="md:hidden h-14 px-4 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-colors"
      style={{
        background: "var(--header-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--header-border)",
      }}
    >
      {/* Brand Icon & Page Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link to="/" className="shrink-0 flex items-center">
          <img
            src={IconImage}
            alt="InternPulse"
            className="w-7 h-7 object-contain rounded-lg shadow-sm"
          />
        </Link>
        <div className="min-w-0">
          <h1
            className="text-sm font-bold truncate leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h1>
          <p
            className="text-[9px] font-medium capitalize truncate opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            {user?.role} portal
          </p>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Quick Theme Toggle */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle Theme"
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95"
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-color)",
          }}
        >
          {isDark ? (
            <Sun size={15} style={{ color: "#FFB703" }} />
          ) : (
            <Moon size={15} style={{ color: "var(--primary)" }} />
          )}
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={openChat}
          type="button"
          aria-label="Open AI Assistant"
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95"
          style={{
            background: "rgba(var(--primary-rgb), 0.12)",
            border: "1px solid rgba(var(--primary-rgb), 0.25)",
          }}
        >
          <Sparkles size={15} style={{ color: "var(--primary)" }} />
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95"
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-color)",
          }}
        >
          <Bell size={15} style={{ color: "var(--text-muted)" }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 text-[8px] font-bold rounded-full flex items-center justify-center text-white"
              style={{
                background: "var(--primary)",
                boxShadow: "0 0 8px rgba(124,58,237,0.6)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile Avatar link */}
        <Link
          to="/settings"
          aria-label="Settings and Profile"
          className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-glow shrink-0 ml-1 active:scale-95 transition-transform"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-hover))",
          }}
        >
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </Link>
      </div>
    </header>
  );
}
