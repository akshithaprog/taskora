import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Moon, Plus, Search, Sun, X } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useTheme } from "../context/ThemeContext";
import { PRIORITY, formatDue, isOverdue, isToday } from "../lib/utils";
import { useTaskUI } from "./Layout";

export default function Topbar({ onMenu }) {
  const { search, setSearch, openCreate, openEdit } = useTaskUI();
  const { tasks } = useTasks();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [bell, setBell] = useState(false);
  const bellRef = useRef(null);

  const alerts = tasks.filter((t) => !t.completed && (isOverdue(t) || isToday(t)));
  const overdueCount = alerts.filter(isOverdue).length;

  useEffect(() => {
    const close = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBell(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-page px-4 py-3 backdrop-blur sm:gap-3 sm:px-8">
      <button className="icon-btn md:hidden" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>

      <div className="relative max-w-md flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input !rounded-xl !py-2 pl-10 pr-9" placeholder="Search tasks, tags, categories" aria-label="Search tasks"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button className="icon-btn" onClick={toggle} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={bellRef}>
          <button className="icon-btn" onClick={() => setBell((b) => !b)} aria-label="Notifications" aria-expanded={bell}>
            <Bell size={18} />
            {alerts.length > 0 && <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-[var(--bg)] ${overdueCount ? "bg-high" : "bg-accent"}`} />}
          </button>
          {bell && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-card p-2 shadow-pop">
              <p className="px-3 py-2 text-sm font-semibold">Needs your attention</p>
              {alerts.length === 0 ? (
                <p className="px-3 pb-3 text-sm text-muted">Nothing is due today or overdue.</p>
              ) : (
                <ul className="max-h-72 overflow-y-auto">
                  {alerts.slice(0, 8).map((t) => (
                    <li key={t.id}>
                      <button className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-hover" onClick={() => { setBell(false); openEdit(t); }}>
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIORITY[t.priority].dot}`} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{t.title}</span>
                          <span className={`text-xs ${isOverdue(t) ? "font-semibold text-high" : "text-muted"}`}>{isOverdue(t) ? "Overdue · " : "Due "}{formatDue(t.due_date)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {overdueCount > 0 && (
                <button className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-accent hover:bg-hover" onClick={() => { setBell(false); navigate("/overdue"); }}>
                  View all overdue tasks
                </button>
              )}
            </div>
          )}
        </div>

        <button className="btn-primary ml-1 !px-3 sm:!px-4" onClick={() => openCreate()}>
          <Plus size={16} /><span className="hidden sm:inline">Add task</span><span className="sr-only sm:hidden">Add task</span>
        </button>
      </div>
    </header>
  );
}
