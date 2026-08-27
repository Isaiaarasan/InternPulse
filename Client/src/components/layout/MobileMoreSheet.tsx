import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  History,
  Target,
  Kanban,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { useNotifStore } from "../../stores/notifStore";
import { useMoreSheetStore } from "../../stores/moreSheetStore";
import { useChatStore } from "../../stores/chatStore";
import { cn } from "../../utils/cn";

export default function MobileMoreSheet() {
  const { isOpen, close } = useMoreSheetStore();
  const { user, logout } = useAuthStore();
  const { isDark, toggle: toggleTheme } = useThemeStore();
  const { unreadCount } = useNotifStore();
  const { open: openChat } = useChatStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    close();
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    close();
  };

  const internExtra = [
    { label: "Submission History", to: "/intern/reports/history", icon: History },
  ];

  const managerExtra = [
    { label: "Create New Goal", to: "/manager/goals/create", icon: Target },
  ];

  const roleExtra =
    user?.role === "manager"
      ? managerExtra
      : user?.role === "intern"
      ? internExtra
      : [];

  const commonItems = [
    {
      label: "Notifications",
      to: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: "Kanban Board", to: "/kanban", icon: Kanban },
    { label: "Calendar", to: "/calendar", icon: Calendar },
    { label: "Settings", to: "/settings", icon: Settings },
    { label: "Help & Support", to: "/help", icon: HelpCircle },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4"
            style={{
              background: "var(--card-bg)",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            {/* Drag Handle Bar */}
            <div className="w-12 h-1.5 rounded-full bg-surface-300 dark:bg-surface-700 mx-auto -mt-1 opacity-50" />

            {/* Header / Profile & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold text-white shadow-glow"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3
                    className="text-sm font-bold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user?.name}
                  </h3>
                  <p
                    className="text-xs capitalize"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {user?.role} Portal • {user?.department || "General"}
                  </p>
                </div>
              </div>

              <button
                onClick={close}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-2 transition-colors"
                style={{
                  color: "var(--text-muted)",
                  background: "var(--bg-surface-2)",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* AI Assistant Quick Launcher Card */}
            <button
              onClick={() => {
                close();
                openChat();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 group text-left"
              style={{
                background: "rgba(var(--primary-rgb), 0.08)",
                border: "1px solid rgba(var(--primary-rgb), 0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <p
                    className="text-xs font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    InternPulse AI Assistant
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Get instant help, summary, or suggestions
                  </p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: "var(--primary)" }} />
            </button>

            {/* Extra Role Links */}
            {roleExtra.length > 0 && (
              <div className="space-y-1">
                <p
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-1"
                  style={{ color: "var(--primary)", opacity: 0.8 }}
                >
                  Workspace Actions
                </p>
                {roleExtra.map(({ label, to, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between p-3 rounded-2xl transition-all duration-150 text-sm font-medium",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "hover:bg-surface-2 text-primaryText"
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "var(--bg-surface-2)" }}
                      >
                        <Icon size={16} />
                      </div>
                      <span>{label}</span>
                    </div>
                    <ChevronRight size={15} className="text-muted opacity-50" />
                  </NavLink>
                ))}
              </div>
            )}

            {/* General Links */}
            <div className="space-y-1">
              <p
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1"
                style={{ color: "var(--primary)", opacity: 0.8 }}
              >
                Tools & General
              </p>
              {commonItems.map(({ label, to, icon: Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between p-3 rounded-2xl transition-all duration-150 text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-surface-2 text-primaryText"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--bg-surface-2)" }}
                    >
                      <Icon size={16} />
                    </div>
                    <span>{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {badge !== undefined && (
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold rounded-full text-white"
                        style={{ background: "var(--primary)" }}
                      >
                        {badge}
                      </span>
                    )}
                    <ChevronRight size={15} className="text-muted opacity-50" />
                  </div>
                </NavLink>
              ))}
            </div>

            {/* Theme & Logout Controls */}
            <div
              className="pt-3 border-t flex items-center justify-between gap-3"
              style={{ borderColor: "var(--border-color)" }}
            >
              <button
                onClick={toggleTheme}
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-semibold transition-all duration-200"
                style={{
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                {isDark ? (
                  <>
                    <Sun size={15} style={{ color: "#FFB703" }} />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={15} style={{ color: "var(--primary)" }} />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-semibold transition-all duration-200"
                style={{
                  background: "rgba(239, 35, 60, 0.08)",
                  border: "1px solid rgba(239, 35, 60, 0.2)",
                  color: "var(--danger)",
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
