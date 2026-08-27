import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  FilePlus2,
  Trophy,
  Users,
  FileCheck2,
  BarChart3,
  Shield,
  Layers,
  Bell,
  Settings,
  Menu,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useMoreSheetStore } from "../../stores/moreSheetStore";
import { cn } from "../../utils/cn";

export default function MobileTabBar() {
  const { user } = useAuthStore();
  const { pathname } = useLocation();
  const { toggle, isOpen } = useMoreSheetStore();

  const internTabs = [
    { label: "Dashboard", to: "/intern/dashboard", icon: LayoutDashboard },
    { label: "Goals", to: "/intern/goals", icon: Target },
    { label: "Submit", to: "/intern/reports/new", icon: FilePlus2, highlight: true },
    { label: "Rankings", to: "/intern/leaderboard", icon: Trophy },
  ];

  const managerTabs = [
    { label: "Dashboard", to: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Interns", to: "/manager/interns", icon: Users },
    { label: "Reviews", to: "/manager/reviews", icon: FileCheck2, highlight: true },
    { label: "Analytics", to: "/manager/analytics", icon: BarChart3 },
  ];

  const adminTabs = [
    { label: "Users", to: "/admin/users", icon: Shield },
    { label: "Cohorts", to: "/admin/cohorts", icon: Layers },
    { label: "Logs", to: "/admin/logs", icon: Bell },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ];

  const currentTabs =
    user?.role === "manager"
      ? managerTabs
      : user?.role === "admin"
      ? adminTabs
      : internTabs;

  return (
    <div className="md:hidden mobile-tab-bar">
      {currentTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.to ||
          (tab.to !== "/intern" &&
            tab.to !== "/manager" &&
            tab.to !== "/admin" &&
            pathname.startsWith(tab.to) &&
            tab.to.split("/").length > 2);

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive: linkActive }) =>
              cn(
                "mobile-tab-item relative group",
                (isActive || linkActive) && "active",
                tab.highlight && "text-primary"
              )
            }
          >
            {tab.highlight ? (
              <div
                className={cn(
                  "w-9 h-9 rounded-2xl flex items-center justify-center -mt-2.5 transition-all duration-200 shadow-md",
                  isActive
                    ? "bg-primary text-white shadow-glow scale-105"
                    : "bg-primary/15 text-primary"
                )}
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, var(--primary), var(--primary-hover))"
                    : "rgba(var(--primary-rgb), 0.12)",
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className="transition-transform duration-200 group-active:scale-90"
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="mobile-tab-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
            )}
            <span
              className={cn(
                "truncate tracking-tight transition-colors duration-200",
                isActive ? "font-bold text-primary" : "text-muted"
              )}
            >
              {tab.label}
            </span>
          </NavLink>
        );
      })}

      {/* More / Menu Tab */}
      <button
        onClick={toggle}
        type="button"
        aria-label="Open More Menu"
        className={cn(
          "mobile-tab-item relative group",
          isOpen && "active text-primary"
        )}
      >
        <div className="relative flex items-center justify-center">
          <Menu
            size={19}
            strokeWidth={isOpen ? 2.5 : 1.8}
            className="transition-transform duration-200 group-active:scale-90"
          />
          {isOpen && (
            <motion.div
              layoutId="activeTabIndicator"
              className="mobile-tab-pill"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </div>
        <span
          className={cn(
            "truncate tracking-tight transition-colors duration-200",
            isOpen ? "font-bold text-primary" : "text-muted"
          )}
        >
          More
        </span>
      </button>
    </div>
  );
}
