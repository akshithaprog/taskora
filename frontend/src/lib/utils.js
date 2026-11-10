// Date helpers and shared constants. Dates are plain "YYYY-MM-DD" strings, always in the user's local time.
const pad = (n) => String(n).padStart(2, "0");
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => toISO(new Date());
export const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d); };

export function formatDue(s) {
  if (!s) return "No date";
  const today = todayStr();
  if (s === today) return "Today";
  if (s === addDays(today, 1)) return "Tomorrow";
  if (s === addDays(today, -1)) return "Yesterday";
  const d = parseISO(s);
  const opts = { weekday: "short", day: "numeric", month: "short" };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
  return d.toLocaleDateString("en-IN", opts);
}

export const isOverdue = (t) => !t.completed && !!t.due_date && t.due_date < todayStr();
export const isToday = (t) => t.due_date === todayStr();
export const isUpcoming = (t) => !t.completed && !!t.due_date && t.due_date > todayStr();

export const PRIORITIES = ["high", "medium", "low"];
// Full class names (not built dynamically) so Tailwind can see them.
export const PRIORITY = {
  high: { label: "High", edge: "bg-high", soft: "bg-high-soft text-high", dot: "bg-high", ring: "border-high", fill: "bg-high" },
  medium: { label: "Medium", edge: "bg-med", soft: "bg-med-soft text-med", dot: "bg-med", ring: "border-med", fill: "bg-med" },
  low: { label: "Low", edge: "bg-low", soft: "bg-low-soft text-low", dot: "bg-low", ring: "border-low", fill: "bg-low" },
};
const RANK = { high: 0, medium: 1, low: 2 };

// Pending first, then by due date (undated last), then by priority.
export function sortTasks(list) {
  return [...list].sort((a, b) =>
    Number(a.completed) - Number(b.completed) ||
    (a.due_date || "9999").localeCompare(b.due_date || "9999") ||
    RANK[a.priority] - RANK[b.priority]);
}

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
export const longDate = () =>
  new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
