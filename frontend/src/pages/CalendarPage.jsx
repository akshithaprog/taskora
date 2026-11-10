import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { PRIORITY, formatDue, parseISO, sortTasks, toISO, todayStr } from "../lib/utils";
import TaskCard from "../components/TaskCard";
import EmptyState from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { useTaskUI } from "../components/Layout";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const { tasks, loading } = useTasks();
  const { openCreate } = useTaskUI();
  const today = todayStr();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(today);

  const year = cursor.getFullYear(), month = cursor.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;          // Monday-first grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - offset + 1;
    return day < 1 || day > daysInMonth ? null : toISO(new Date(year, month, day));
  });

  const byDate = {};
  tasks.forEach((t) => { if (t.due_date) (byDate[t.due_date] ||= []).push(t); });
  const move = (n) => setCursor(new Date(year, month + n, 1));
  const goToday = () => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setSelected(today); };
  const dayTasks = sortTasks(byDate[selected] || []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Calendar</h1>
          <p className="mt-1 text-muted">Deadlines by day, coloured by priority.</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="icon-btn border border-line bg-card" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft size={18} /></button>
          <span className="min-w-[9.5rem] text-center font-display text-lg font-semibold">{cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
          <button className="icon-btn border border-line bg-card" onClick={() => move(1)} aria-label="Next month"><ChevronRight size={18} /></button>
          <button className="btn-ghost ml-2 !py-2" onClick={goToday}>Today</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="panel overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line bg-side text-center text-xs font-medium text-muted">
            {WEEKDAYS.map((d) => <div key={d} className="py-2.5">{d}</div>)}
          </div>
          {loading ? <Skeleton className="m-4 h-72" /> : (
            <div className="grid grid-cols-7">
              {cells.map((date, i) => {
                if (!date) return <div key={i} className="min-h-[3.75rem] border-b border-r border-line bg-side sm:min-h-[6.5rem]" />;
                const list = sortTasks(byDate[date] || []);
                const isSel = date === selected, isNow = date === today;
                return (
                  <button key={date} onClick={() => setSelected(date)} aria-label={`${formatDue(date)}, ${list.length} tasks`} aria-pressed={isSel}
                    className={`flex min-h-[3.75rem] flex-col items-start justify-start border-b border-r border-line p-1.5 text-left transition hover:bg-hover sm:min-h-[6.5rem] sm:p-2 ${isSel ? "bg-accent-soft" : ""}`}>
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isNow ? "bg-accent text-white" : ""}`}>{parseISO(date).getDate()}</span>
                    <div className="mt-1 hidden w-full space-y-1 sm:block">
                      {list.slice(0, 2).map((t) => (
                        <div key={t.id} className={`truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${PRIORITY[t.priority].soft} ${t.completed ? "line-through opacity-60" : ""}`}>{t.title}</div>
                      ))}
                      {list.length > 2 && <div className="px-1 text-[11px] text-muted">+{list.length - 2} more</div>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                      {list.slice(0, 4).map((t) => <span key={t.id} className={`h-1.5 w-1.5 rounded-full ${PRIORITY[t.priority].dot}`} />)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{formatDue(selected) === "Today" ? "Today" : parseISO(selected).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</h2>
            <button className="btn-ghost !px-3 !py-1.5" onClick={() => openCreate(selected)}><Plus size={15} />Add</button>
          </div>
          {dayTasks.length ? (
            <ul className="space-y-3">{dayTasks.map((t) => <TaskCard key={t.id} task={t} />)}</ul>
          ) : (
            <div className="panel"><EmptyState variant="calendar" title="A free day" text="No tasks are due on this date." /></div>
          )}
        </aside>
      </div>
    </div>
  );
}
