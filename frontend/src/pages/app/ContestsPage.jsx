import { useState, useEffect } from 'react';
import { contestsApi } from '../../services/contestsApi.js';
import { formatDate } from '../../utils/formatDate.js';
import { formatRatingChange } from '../../utils/formatRating.js';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';

export default function ContestsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    contestsApi.getContests({ page })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  };

  useEffect(load, [page]);

  const contests = data?.contests || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">Contests</h2>
        <p className="text-sm text-[#6b7280]">All Codeforces contests you have participated in.</p>
      </div>

      {loading ? <TableSkeleton rows={8} />
        : error ? <ErrorState title="Failed to load contests" onRetry={load} />
        : !contests.length ? <EmptyState icon="🏆" title="No contest history" description="Participate in Codeforces contests to see them here." />
        : (
          <>
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
                      <tr key={c.id || i} onClick={() => setSelected(c)}
                        className="border-b border-[#1e2030] hover:bg-[#161820] cursor-pointer transition-colors">
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
            <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total || 0} pageSize={20} onChange={setPage} />
          </>
        )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Date', value: formatDate(selected.date) },
                { label: 'Rank', value: selected.rank ? `#${selected.rank}` : '—' },
                { label: 'Rating Change', value: formatRatingChange(selected.ratingChange), color: selected.ratingChange > 0 ? '#10b981' : '#ef4444' },
              ].map(s => (
                <div key={s.label} className="bg-[#0d0e14] rounded-lg p-3">
                  <p className="text-[10px] uppercase text-[#6b7280] mb-1">{s.label}</p>
                  <p className="text-sm font-semibold font-mono" style={{ color: s.color || '#e8eaf0' }}>{s.value}</p>
                </div>
              ))}
            </div>
            {selected.problems?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#9ca3c4]">Problems</p>
                {selected.problems.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1e2030] last:border-0 text-xs">
                    <span className="text-[#e8eaf0]">{p.name}</span>
                    <span className={p.solved ? 'text-[#10b981]' : 'text-[#6b7280]'}>{p.solved ? 'Solved' : 'Unsolved'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
