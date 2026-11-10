import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTasks } from "../context/TasksContext";
import { useTheme } from "../context/ThemeContext";
import { PRIORITIES, PRIORITY } from "../lib/utils";
import ProgressRing from "../components/ProgressRing";
import { Skeleton } from "../components/Skeleton";

// Recharts draws SVG attributes, so it gets real hex values for each theme.
const COLORS = {
  light: { high: "#D64545", medium: "#D9811A", low: "#3C9A5E", accent: "#7661C5", soft: "#E3DEF5", grid: "#E6E3DB", text: "#77736B" },
  dark: { high: "#F27B7B", medium: "#F0AE55", low: "#6CC68B", accent: "#A08DF0", soft: "#3A3460", grid: "#34323F", text: "#9D99A9" },
};
const tooltipStyle = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--ink)", fontSize: 13, boxShadow: "none" };

function Card({ title, sub, children, className = "" }) {
  return (
    <section className={`panel p-5 ${className}`}>
      <h2 className="text-base font-semibold">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Donut({ data, center, centerLabel }) {
  return (
    <div className="relative h-52">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={62} outerRadius={84} paddingAngle={data.filter((d) => d.value).length > 1 ? 3 : 0} stroke="none" animationDuration={800}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold">{center}</span>
        <span className="text-xs text-muted">{centerLabel}</span>
      </div>
    </div>
  );
}

const Legend = ({ items }) => (
  <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-sm">
    {items.map((i) => <li key={i.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />{i.name}<span className="text-muted">{i.value}</span></li>)}
  </ul>
);

export default function Analytics() {
  const { stats, loading, error, reload } = useTasks();
  const { theme } = useTheme();
  const c = COLORS[theme];

  if (error) return <div className="panel p-10 text-center"><p className="mb-4 font-medium">{error}</p><button className="btn-primary" onClick={reload}>Try again</button></div>;
  if (loading || !stats) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div></div>;

  const priorityData = PRIORITIES.map((p) => ({ name: PRIORITY[p].label, value: stats.priorities[p].total, color: c[p] }));
  const statusData = [{ name: "Completed", value: stats.completed, color: c.low }, { name: "Pending", value: stats.pending - stats.overdue, color: c.accent }, { name: "Overdue", value: stats.overdue, color: c.high }];
  const weekTotal = stats.weekly.reduce((n, d) => n + d.completed, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="mt-1 text-muted">How your work is going.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <Card title="Productivity score" sub="Completed tasks finished on or before their due date.">
          <div className="flex justify-center"><ProgressRing value={stats.productivity} size={150} label="on time" /></div>
          <p className="mt-4 text-center text-sm text-muted">{stats.progress}% of all tasks completed</p>
        </Card>

        <Card title="Completed this week" sub={`${weekTotal} ${weekTotal === 1 ? "task" : "tasks"} finished in the last 7 days.`}>
          <div className="h-60">
            <ResponsiveContainer>
              <BarChart data={stats.weekly} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: c.text, fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: c.text, fontSize: 12 }} />
                <Tooltip cursor={{ fill: c.soft, opacity: 0.5 }} contentStyle={tooltipStyle} formatter={(v) => [v, "Completed"]} />
                <Bar dataKey="completed" fill={c.accent} radius={[6, 6, 0, 0]} maxBarSize={38} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Priority distribution" sub="All tasks, by priority.">
          <Donut data={priorityData} center={stats.total} centerLabel="tasks" />
          <Legend items={priorityData} />
        </Card>
        <Card title="Completed vs pending" sub="Where every task stands today.">
          <Donut data={statusData} center={`${stats.progress}%`} centerLabel="done" />
          <Legend items={statusData} />
        </Card>
      </div>
    </div>
  );
}
