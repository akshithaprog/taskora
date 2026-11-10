import { AlertTriangle, CheckCircle2, Clock, ListTodo, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TasksContext";
import { PRIORITIES, PRIORITY, greeting, isToday, isUpcoming, longDate, sortTasks } from "../lib/utils";
import StatCard from "../components/StatCard";
import ProgressRing from "../components/ProgressRing";
import TaskCard from "../components/TaskCard";
import EmptyState from "../components/EmptyState";
import { StatSkeletons, TaskSkeletons } from "../components/Skeleton";
import { useTaskUI } from "../components/Layout";

function Section({ title, to, children }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {to && <Link to={to} className="text-sm font-medium text-accent hover:underline">View all</Link>}
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, stats, loading, error, reload } = useTasks();
  const { openCreate } = useTaskUI();

  const today = sortTasks(tasks.filter(isToday));
  const upcoming = sortTasks(tasks.filter(isUpcoming)).slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">{greeting()}, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-muted">{longDate()}</p>
      </div>

      {error ? (
        <div className="panel flex flex-col items-center gap-3 p-10 text-center">
          <p className="font-medium">We couldn't load your tasks.</p>
          <p className="text-sm text-muted">{error}</p>
          <button className="btn-primary" onClick={reload}>Try again</button>
        </div>
      ) : loading || !stats ? (
        <><StatSkeletons /><TaskSkeletons /></>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total tasks" value={stats.total} icon={ListTodo} />
            <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="low" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} tone="med" />
            <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="high" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              <Section title="Today" to="/my-day">
                {today.length ? (
                  <ul className="space-y-3">{today.map((t) => <TaskCard key={t.id} task={t} />)}</ul>
                ) : (
                  <div className="panel"><EmptyState variant="done" title="Nothing due today" text="Enjoy the space, or plan something for later."
                    action={<button className="btn-primary" onClick={() => openCreate()}><Plus size={16} />Add task</button>} /></div>
                )}
              </Section>
              <Section title="Upcoming deadlines" to="/upcoming">
                {upcoming.length ? (
                  <ul className="space-y-3">{upcoming.map((t) => <TaskCard key={t.id} task={t} />)}</ul>
                ) : (
                  <div className="panel"><EmptyState variant="calendar" title="No upcoming deadlines" text="Tasks with a future due date will show up here." /></div>
                )}
              </Section>
            </div>

            <aside className="space-y-4">
              <div className="panel flex flex-col items-center p-6">
                <ProgressRing value={stats.progress} label="complete" />
                <p className="mt-4 text-sm text-muted">{stats.completed} of {stats.total} tasks done</p>
              </div>
              <div className="panel p-5">
                <h2 className="mb-4 text-base font-semibold">By priority</h2>
                <div className="space-y-4">
                  {PRIORITIES.map((p) => {
                    const { total, pending } = stats.priorities[p];
                    return (
                      <div key={p}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className={`inline-flex items-center gap-2 font-medium`}><span className={`h-2 w-2 rounded-full ${PRIORITY[p].dot}`} />{PRIORITY[p].label}</span>
                          <span className="text-muted">{pending} pending</span>
                        </div>
                        <div className={`h-2 overflow-hidden rounded-full ${PRIORITY[p].soft}`}>
                          <div className={`h-full rounded-full ${PRIORITY[p].fill} transition-all duration-700`} style={{ width: `${total ? ((total - pending) / total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-muted">Filled bar shows how much of each priority is done.</p>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
