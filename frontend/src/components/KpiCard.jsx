export default function KpiCard({ label, value }) {
  return (
    <div className="p-4 rounded-2xl bg-white shadow-sm border">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
