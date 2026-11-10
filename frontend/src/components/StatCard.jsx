export default function StatCard({ label, value, icon: Icon, tone = "accent" }) {
  const tones = {
    accent: "bg-accent-soft text-accent",
    low: "bg-low-soft text-low",
    med: "bg-med-soft text-med",
    high: "bg-high-soft text-high",
  };
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={16} /></span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
