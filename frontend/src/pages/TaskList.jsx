import { useState } from "react";
import { Plus } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { PRIORITIES, PRIORITY, isOverdue, isToday, isUpcoming, sortTasks } from "../lib/utils";
import TaskCard from "../components/TaskCard";
import EmptyState from "../components/EmptyState";
import { TaskSkeletons } from "../components/Skeleton";
import { useTaskUI } from "../components/Layout";

const VIEWS = {
  all: { title: "All tasks", sub: "Everything on your plate.", match: () => true, status: true,
    empty: { variant: "tasks", title: "No tasks yet", text: "Add your first task and give it a priority." } },
  "my-day": { title: "My Day", sub: "What's due today.", match: isToday, status: true,
    empty: { variant: "done", title: "Nothing due today", text: "Tasks due today will appear here." } },
  upcoming: { title: "Upcoming", sub: "Pending tasks with a date ahead.", match: isUpcoming, status: false,
    empty: { variant: "calendar", title: "Nothing coming up", text: "Tasks with a future due date will appear here." } },
  completed: { title: "Completed", sub: "Finished work. Nicely done.", match: (t) => t.completed, status: false,
    empty: { variant: "done", title: "Nothing completed yet", text: "Tick off a task and it will move here." } },
  overdue: { title: "Overdue", sub: "Past their due date and still open.", match: isOverdue, status: false,
    empty: { variant: "done", title: "You're all caught up", text: "No overdue tasks. Keep it going." } },
};

const Chip = ({ active, onClick, children }) => (
  <button onClick={onClick} aria-pressed={active}
    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${active ? "border-accent bg-accent-soft text-accent" : "border-line bg-card text-muted hover:bg-hover hover:text-ink"}`}>
    {children}
  </button>
);

export default function TaskList({ view }) {
  const cfg = VIEWS[view];
  const { tasks, loading, error, reload } = useTasks();
  const { search, setSearch, openCreate } = useTaskUI();
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");

  const q = search.trim().toLowerCase();
  const visible = sortTasks(tasks.filter((t) =>
    cfg.match(t) &&
    (priority === "all" || t.priority === priority) &&
    (!cfg.status || status === "all" || (status === "completed") === t.completed) &&
    (!q || [t.title, t.description, t.category, ...t.tags].join(" ").toLowerCase().includes(q))));

  const filtered = q || priority !== "all" || status !== "all";
  const clear = () => { setSearch(""); setPriority("all"); setStatus("all"); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{cfg.title}</h1>
        <p className="mt-1 text-muted">{cfg.sub}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
        <Chip active={priority === "all"} onClick={() => setPriority("all")}>All priorities</Chip>
        {PRIORITIES.map((p) => (
          <Chip key={p} active={priority === p} onClick={() => setPriority(p)}>
            <span className={`h-2 w-2 rounded-full ${PRIORITY[p].dot}`} />{PRIORITY[p].label}
          </Chip>
        ))}
        {cfg.status && (
          <>
            <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
            {["all", "pending", "completed"].map((s) => (
              <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s === "all" ? "Any status" : s[0].toUpperCase() + s.slice(1)}</Chip>
            ))}
          </>
        )}
      </div>

      {error ? (
        <div className="panel p-10 text-center"><p className="mb-1 font-medium">We couldn't load your tasks.</p><p className="mb-4 text-sm text-muted">{error}</p><button className="btn-primary" onClick={reload}>Try again</button></div>
      ) : loading ? (
        <TaskSkeletons />
      ) : visible.length === 0 ? (
        <div className="panel">
          {filtered ? (
            <EmptyState variant="search" title="No matching tasks" text="Try a different search or clear the filters."
              action={<button className="btn-ghost" onClick={clear}>Clear filters</button>} />
          ) : (
            <EmptyState {...cfg.empty} action={view !== "completed" && view !== "overdue" ? <button className="btn-primary" onClick={() => openCreate()}><Plus size={16} />Add task</button> : null} />
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">{visible.length} {visible.length === 1 ? "task" : "tasks"}</p>
          <ul className="space-y-3">{visible.map((t) => <TaskCard key={t.id} task={t} />)}</ul>
        </>
      )}
    </div>
  );
}
