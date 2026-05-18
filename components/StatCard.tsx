export function StatCard({
  label,
  value,
  sub
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <p className="text-sm text-ink/55">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
      {sub ? <p className="mt-1 text-xs text-ink/55">{sub}</p> : null}
    </div>
  );
}
