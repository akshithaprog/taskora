// Small inline illustrations in the app's palette, so empty screens feel designed rather than blank.
const art = {
  tasks: (
    <>
      <rect x="38" y="22" width="84" height="104" rx="12" fill="var(--card)" stroke="var(--line)" strokeWidth="2" />
      <rect x="62" y="14" width="36" height="16" rx="8" fill="var(--accent)" />
      {[48, 72, 96].map((y, i) => (
        <g key={y}>
          <circle cx="56" cy={y} r="7" fill={["var(--high-bg)", "var(--med-bg)", "var(--low-bg)"][i]} stroke={["var(--high)", "var(--med)", "var(--low)"][i]} strokeWidth="2" />
          <rect x="70" y={y - 3} width={[42, 34, 38][i]} height="6" rx="3" fill="var(--line)" />
        </g>
      ))}
    </>
  ),
  done: (
    <>
      <circle cx="80" cy="74" r="44" fill="var(--accent-soft)" />
      <circle cx="80" cy="74" r="30" fill="var(--accent)" />
      <path d="M66 74l10 10 20-22" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28" cy="40" r="5" fill="var(--med)" /><circle cx="134" cy="48" r="4" fill="var(--low)" />
      <circle cx="122" cy="116" r="5" fill="var(--high)" /><circle cx="36" cy="112" r="4" fill="var(--accent)" />
    </>
  ),
  search: (
    <>
      <circle cx="72" cy="66" r="34" fill="var(--card)" stroke="var(--accent)" strokeWidth="6" />
      <path d="M97 92l30 30" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" />
      <path d="M58 66h28" stroke="var(--line)" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  calendar: (
    <>
      <rect x="30" y="28" width="100" height="92" rx="12" fill="var(--card)" stroke="var(--line)" strokeWidth="2" />
      <path d="M30 52h100v-12a12 12 0 00-12-12H42a12 12 0 00-12 12z" fill="var(--accent)" />
      {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => (
        <rect key={`${c}${r}`} x={44 + c * 22} y={64 + r * 16} width="12" height="8" rx="3" fill={c === 1 && r === 1 ? "var(--accent)" : "var(--line)"} />
      )))}
    </>
  ),
};

export default function EmptyState({ variant = "tasks", title, text, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <svg viewBox="0 0 160 140" className="mb-5 h-32 w-40" aria-hidden="true">{art[variant]}</svg>
      <h3 className="text-lg font-semibold">{title}</h3>
      {text && <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
