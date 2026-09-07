import { useState, useEffect } from 'react';
import { problemsApi } from '../../services/problemsApi.js';
import { formatDate } from '../../utils/formatDate.js';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Select from '../../components/common/Select.jsx';

const HIST_STATUS = { recommended: 'info', opened: 'warning', completed: 'success', skipped: 'neutral', expired: 'error' };

export default function ProblemHistoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ status: '' });

  const load = () => {
    setLoading(true);
    problemsApi.getHistory({ page, ...filter })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  };

  useEffect(load, [page, filter]);

  const history = data?.history || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#e8eaf0]">Problem History</h2>
          <p className="text-sm text-[#6b7280]">All problems recommended to you and their outcomes.</p>
        </div>
        <Select value={filter.status} onChange={e => { setFilter({ status: e.target.value }); setPage(1); }} className="text-xs py-1.5">
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="skipped">Skipped</option>
          <option value="recommended">Recommended</option>
          <option value="expired">Expired</option>
        </Select>
      </div>

      {loading ? <TableSkeleton rows={8} />
        : error ? <ErrorState title="Failed to load history" onRetry={load} />
        : !history.length ? <EmptyState icon="📜" title="No history yet" description="Your problem history will appear here once you start receiving recommendations." />
        : (
          <>
            <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2030] text-[#6b7280] uppercase tracking-wide">
                      {['Problem', 'Topic', 'Difficulty', 'Recommended', 'Status', 'Completed'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={h.id || i} className="border-b border-[#1e2030] hover:bg-[#161820] transition-colors">
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="font-medium text-[#e8eaf0] truncate">{h.problemName}</p>
                        </td>
                        <td className="px-4 py-3 text-[#9ca3c4] capitalize">{h.topic || '—'}</td>
                        <td className="px-4 py-3 font-mono text-[#9ca3c4]">{h.rating ?? '?'}</td>
                        <td className="px-4 py-3 text-[#6b7280]">{formatDate(h.recommendedAt)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={HIST_STATUS[h.status] || 'neutral'} className="capitalize">{h.status}</StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-[#6b7280]">{h.completedAt ? formatDate(h.completedAt) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total || 0} pageSize={20} onChange={setPage} />
          </>
        )}
    </div>
  );
}
