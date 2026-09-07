import { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/analyticsApi.js';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Modal from '../../components/common/Modal.jsx';

function strengthStatus(score) {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'error';
}

function strengthLabel(score) {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Average';
  return 'Weak';
}

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    analyticsApi.getTopics()
      .then(d => { const t = d?.topics || []; setTopics(t); setFiltered(t); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  };

  useEffect(load, []);

  const handleSearch = (q) => {
    const lower = q.toLowerCase();
    setFiltered(topics.filter(t => t.topic.toLowerCase().includes(lower)));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#e8eaf0]">Topic Analytics</h2>
          <p className="text-sm text-[#6b7280]">Your performance across all DSA topics.</p>
        </div>
        <SearchInput onSearch={handleSearch} placeholder="Search topics…" className="w-48" />
      </div>

      {loading ? <TableSkeleton rows={8} />
        : error ? <ErrorState title="Failed to load topics" onRetry={load} />
        : !filtered.length ? <EmptyState icon="🏷️" title="No topic data" description="Sync your Codeforces account to analyze your topic performance." />
        : (
          <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e2030] text-[#6b7280] uppercase tracking-wide">
                    {['Topic', 'Solved', 'Attempts', 'Success Rate', 'Avg Rating', 'Score', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.topic} onClick={() => setSelected(t)}
                      className="border-b border-[#1e2030] hover:bg-[#161820] cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-medium text-[#e8eaf0] capitalize">{t.topic}</td>
                      <td className="px-4 py-3 font-mono text-[#9ca3c4]">{t.solved ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-[#9ca3c4]">{t.attempts ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-[#9ca3c4]">
                        {t.attempts ? `${Math.round((t.solved / t.attempts) * 100)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[#9ca3c4]">{t.avgRating ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-[#e8eaf0]">{t.strengthScore ?? '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={strengthStatus(t.strengthScore)}>{strengthLabel(t.strengthScore)}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Topic Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.topic} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Strength Score', value: `${selected.strengthScore ?? '—'}%` },
                { label: 'Solved', value: selected.solved ?? '—' },
                { label: 'Attempts', value: selected.attempts ?? '—' },
              ].map(s => (
                <div key={s.label} className="bg-[#0d0e14] rounded-lg p-3">
                  <p className="text-[10px] uppercase text-[#6b7280] mb-1">{s.label}</p>
                  <p className="text-lg font-bold font-mono text-[#e8eaf0]">{s.value}</p>
                </div>
              ))}
            </div>
            <StatusBadge status={strengthStatus(selected.strengthScore)} className="text-sm">
              {strengthLabel(selected.strengthScore)}
            </StatusBadge>
            {selected.weaknessReason && (
              <div className="bg-[#0d0e14] rounded-lg p-4">
                <p className="text-xs text-[#6b7280] font-medium mb-1">Analysis</p>
                <p className="text-sm text-[#9ca3c4]">{selected.weaknessReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
