import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileHeader from "./MobileHeader";
import MobileTabBar from "./MobileTabBar";
import MobileMoreSheet from "./MobileMoreSheet";
import AIChatPanel from "./AIChatPanel";
import { useChatStore } from "../../stores/chatStore";

const pageTitles: Record<string, string> = {
  "/intern/dashboard": "Dashboard",
  "/intern/goals": "My Goals",
  "/intern/reports/new": "Submit Report",
  "/intern/reports/history": "Report History",
  "/intern/leaderboard": "Leaderboard",
  "/manager/dashboard": "Manager Dashboard",
  "/manager/interns": "Intern Directory",
  "/manager/goals/create": "Create Goal",
  "/manager/reviews": "Review Queue",
  "/manager/analytics": "Analytics",
  "/admin/users": "User Management",
  "/admin/cohorts": "Cohorts & Batches",
  "/admin/logs": "Notification Logs",
  "/admin/settings": "System Settings",
  "/notifications": "Notifications",
  "/kanban": "Kanban Board",
  "/calendar": "Calendar",
  "/settings": "Settings",
  "/help": "Help & Support",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  
  // Find title by direct match or prefix match for dynamic IDs
  let title = pageTitles[pathname];
  if (!title) {
    if (pathname.startsWith("/intern/goals/")) title = "Goal Details";
    else if (pathname.startsWith("/manager/interns/")) title = "Intern Profile";
    else if (pathname.startsWith("/intern/reports/")) title = "Report Review";
    else title = "InternPulse";
  }

  const { isOpen, close } = useChatStore();

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Desktop Header (hidden on mobile) */}
        <div className="hidden md:block">
          <Header title={title} />
        </div>

        {/* Mobile Header (hidden on desktop) */}
        <MobileHeader title={title} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (hidden on desktop) */}
      <MobileTabBar />

      {/* Mobile More Bottom Sheet (hidden on desktop) */}
      <MobileMoreSheet />

      {/* Global AI Chat Overlay */}
      <AIChatPanel isOpen={isOpen} onClose={close} />
    </div>
  );
}
