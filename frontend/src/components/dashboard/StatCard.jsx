import { Skeleton } from '../common/Skeleton.jsx';

export default function StatCard({ label, value, sub, color, loading }) {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-lg p-4 hover:border-[#252840] transition-colors">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] mb-2">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-24 mb-1" />
      ) : value !== null && value !== undefined ? (
        <p className="text-2xl font-bold font-mono" style={{ color: color || '#e8eaf0' }}>{value}</p>
      ) : (
        <p className="text-xl font-mono text-[#4b5563]">—</p>
      )}
      {sub && !loading && <p className="text-[11px] text-[#6b7280] mt-1">{sub}</p>}
    </div>
  );
}
