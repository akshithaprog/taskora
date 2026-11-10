import { NavLink } from "react-router-dom";
import { BarChart3, CalendarDays, CalendarRange, CheckCircle2, LayoutDashboard, ListTodo, LogOut, AlertTriangle, Settings, Sun, X } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TasksContext";
import { initials, isOverdue, isToday } from "../lib/utils";

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { tasks } = useTasks();
  const dayCount = tasks.filter((t) => !t.completed && isToday(t)).length;
  const overdueCount = tasks.filter(isOverdue).length;

  const items = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/my-day", label: "My Day", icon: Sun, count: dayCount },
    { to: "/tasks", label: "All Tasks", icon: ListTodo },
    { to: "/upcoming", label: "Upcoming", icon: CalendarRange },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/completed", label: "Completed", icon: CheckCircle2 },
    { to: "/overdue", label: "Overdue", icon: AlertTriangle, count: overdueCount, alert: true },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-side px-3 py-5 transition-transform duration-200 md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Main navigation">
        <div className="mb-6 flex items-center justify-between px-3">
          <Logo />
          <button className="icon-btn md:hidden" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {items.map(({ to, label, icon: Icon, end, count, alert }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-card text-accent shadow-card" : "text-muted hover:bg-hover hover:text-ink"}`}>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${alert ? "bg-high-soft text-high" : "bg-accent-soft text-accent"}`}>{count}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-card p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">{initials(user.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <button className="icon-btn" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
        </div>
      </aside>
    </>
  );
}
