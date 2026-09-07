import { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/analyticsApi.js';
import { ChartSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function DifficultyPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    analyticsApi.getDifficulty()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  };

  useEffect(load, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">Difficulty Analytics</h2>
        <p className="text-sm text-[#6b7280]">Your performance across different problem difficulty bands.</p>
      </div>

      {loading ? (
        <div className="space-y-4"><ChartSkeleton /><ChartSkeleton /></div>
      ) : error ? (
        <ErrorState title="Failed to load difficulty data" onRetry={load} />
      ) : !data?.distribution?.length ? (
        <EmptyState icon="📊" title="No difficulty data" description="Sync your Codeforces account to view difficulty analytics." />
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-[#111218] border border-[#1e2030] rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Avg Solved Rating</p>
              <p className="text-2xl font-bold font-mono text-[#e8eaf0]">{data.avgSolvedRating ?? '—'}</p>
            </div>
            <div className="bg-[#111218] border border-[#1e2030] rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Hardest Solved</p>
              <p className="text-xl font-bold font-mono text-[#8b5cf6]">{data.hardestSolved ?? '—'}</p>
            </div>
            <div className="bg-[#111218] border border-[#1e2030] rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">Recommended Next</p>
              <p className="text-xl font-bold font-mono text-[#6366f1]">{data.recommendedNextDifficulty ?? '—'}</p>
            </div>
          </div>

          {/* Distribution */}
          <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e2030]">
              <p className="text-sm font-medium text-[#e8eaf0]">Problems by Difficulty</p>
            </div>
            <div className="p-4 space-y-3">
              {data.distribution.map(band => {
                const successRate = band.attempted > 0 ? Math.round((band.solved / band.attempted) * 100) : 0;
                return (
                  <div key={band.rating} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#9ca3c4] font-mono">{band.rating}</span>
                      <span className="text-[#6b7280]">{band.solved} / {band.attempted} solved ({successRate}%)</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div className="bg-[#10b981]/50 rounded-l" style={{ width: `${(band.solved / Math.max(...data.distribution.map(b => b.attempted))) * 100}%` }} />
                      <div className="bg-[#1a1c2a] rounded-r flex-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
