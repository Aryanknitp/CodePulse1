import { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/analyticsApi.js';
import { formatDate } from '../../utils/formatDate.js';
import { formatRatingChange, getRatingColor } from '../../utils/formatRating.js';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function ContestAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    analyticsApi.getContests()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  };

  useEffect(load, []);

  const contests = data?.contests || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">Contest Analytics</h2>
        <p className="text-sm text-[#6b7280]">Your Codeforces contest performance.</p>
      </div>

      {!loading && !error && data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Contests', value: data.contestCount ?? '—' },
            { label: 'Best Rank', value: data.bestRank ? `#${data.bestRank}` : '—' },
            { label: 'Avg Rank', value: data.avgRank ? `#${data.avgRank}` : '—' },
            { label: 'Total Rating Change', value: formatRatingChange(data.totalRatingChange), color: data.totalRatingChange > 0 ? '#10b981' : '#ef4444' },
          ].map(s => (
            <div key={s.label} className="bg-[#111218] border border-[#1e2030] rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">{s.label}</p>
              <p className="text-2xl font-bold font-mono" style={{ color: s.color || '#e8eaf0' }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? <TableSkeleton rows={8} />
        : error ? <ErrorState title="Failed to load contest data" onRetry={load} />
        : !contests.length ? <EmptyState icon="🏆" title="No contests" description="No contest data available. Sync your account." />
        : (
          <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e2030] text-[#6b7280] uppercase tracking-wide">
                    {['Contest', 'Date', 'Rank', 'Rating Change', 'Solved'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contests.map((c, i) => (
                    <tr key={c.id || i} className="border-b border-[#1e2030] hover:bg-[#161820] transition-colors">
                      <td className="px-4 py-3 max-w-[240px]">
                        <p className="font-medium text-[#e8eaf0] truncate">{c.name}</p>
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">{formatDate(c.date)}</td>
                      <td className="px-4 py-3 font-mono text-[#9ca3c4]">#{c.rank ?? '—'}</td>
                      <td className="px-4 py-3 font-mono font-semibold" style={{ color: c.ratingChange > 0 ? '#10b981' : c.ratingChange < 0 ? '#ef4444' : '#9ca3af' }}>
                        {formatRatingChange(c.ratingChange)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#9ca3c4]">{c.solved ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
