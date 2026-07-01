import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Kanban,
  Calendar,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { cn } from "../../utils/cn";
import { useState } from "react";
import QuickThemePickerSidebar from "./QuickThemePickerSidebar";
import LogoImage from "../../assets/Logo.png";
import IconImage from "../../assets/IN.png";

const internMenu = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/intern/dashboard" },
  { icon: Target, label: "My Goals", to: "/intern/goals" },
  { icon: FileText, label: "Submit Report", to: "/intern/reports/new" },
  { icon: FileText, label: "History", to: "/intern/reports/history" },
  { icon: Trophy, label: "Leaderboard", to: "/intern/leaderboard" },
];
const managerMenu = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/manager/dashboard" },
  { icon: Users, label: "Interns", to: "/manager/interns" },
  { icon: Target, label: "Create Goal", to: "/manager/goals/create" },
  { icon: FileText, label: "Review Queue", to: "/manager/reviews" },
  { icon: BarChart3, label: "Analytics", to: "/manager/analytics" },
];
const adminMenu = [
  { icon: Shield, label: "Users", to: "/admin/users" },
  { icon: Users, label: "Cohorts", to: "/admin/cohorts" },
  { icon: Bell, label: "Notif Logs", to: "/admin/logs" },
  { icon: Settings, label: "Settings", to: "/admin/settings" },
];
const commonMenu = [
  { icon: Bell, label: "Notifications", to: "/notifications" },
  { icon: Kanban, label: "Kanban Board", to: "/kanban" },
  { icon: Calendar, label: "Calendar", to: "/calendar" },
  { icon: Settings, label: "Settings", to: "/settings" },
  { icon: HelpCircle, label: "Help", to: "/help" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const roleMenu =
    user?.role === "manager"
      ? managerMenu
      : user?.role === "admin"
        ? adminMenu
        : internMenu;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "h-screen flex flex-col relative shrink-0 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[270px]",
      )}
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 h-[68px] px-4 shrink-0",
          collapsed && "justify-center px-2",
        )}
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        {collapsed ? (
          <img src={IconImage} alt="InternPulse Icon" className="w-9 h-9 object-contain shrink-0" />
        ) : (
          <div className="flex flex-col justify-center">
             <img src={LogoImage} alt="InternPulse Logo" className="h-8 object-contain" />
             <p className="text-[10px] font-medium capitalize mt-0.5" style={{ color: "var(--text-muted)" }}>{user?.role} Portal</p>
          </div>
        )}
      </div>

      {/* Quick Theme Picker */}
      {!collapsed && <QuickThemePickerSidebar />}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {!collapsed && (
          <p
            className="text-[10px] font-bold uppercase px-3 pb-2 pt-1 tracking-widest"
            style={{ color: "var(--primary)", opacity: 0.7 }}
          >
            {user?.role === "manager"
              ? "Management"
              : user?.role === "admin"
                ? "Administration"
                : "My Workspace"}
          </p>
        )}
        {roleMenu.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "sidebar-item",
                isActive && "active",
                collapsed && "justify-center px-2",
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        <div
          className="my-2 mx-1"
          style={{ height: "1px", background: "var(--sidebar-border)" }}
        />

        {!collapsed && (
          <p
            className="text-[10px] font-bold uppercase px-3 pb-2 tracking-widest"
            style={{ color: "var(--primary)", opacity: 0.7 }}
          >
            General
          </p>
        )}
        {commonMenu.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "sidebar-item",
                isActive && "active",
                collapsed && "justify-center px-2",
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div
        className="shrink-0 p-3"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <div
          className={cn(
            "flex items-center gap-3 p-2.5 rounded-2xl mb-2",
            collapsed && "justify-center",
          )}
          style={{
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))" }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {user?.name}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {user?.email}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign Out" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200",
            collapsed && "justify-center px-2",
          )}
          style={{ color: "var(--danger)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,35,60,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut size={15} />
          {!collapsed && "Sign Out"}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-[88px] w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-10"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          color: "var(--primary)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}
