import { PRIORITY } from "../lib/utils";

export default function PriorityBadge({ priority }) {
  const p = PRIORITY[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.soft}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}
