export default function StatCard({ label, value, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand/10 text-brand-700',
    income: 'bg-emerald-50 text-income',
    expense: 'bg-blue-50 text-expense'
  };

  return (
    <div className="rounded-card bg-white p-4 shadow-panel">
      <p className="text-xs text-slateSoft">{label}</p>
      <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xl font-bold ${accents[accent]}`}>{value}</p>
    </div>
  );
}
