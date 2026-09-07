import { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/analyticsApi.js';
import { formatDateTime } from '../../utils/formatDate.js';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Select from '../../components/common/Select.jsx';

const VERDICT_STATUS = {
  'OK': 'success',
  'WRONG_ANSWER': 'error',
  'TIME_LIMIT_EXCEEDED': 'warning',
  'COMPILATION_ERROR': 'neutral',
  'RUNTIME_ERROR': 'error',
  'MEMORY_LIMIT_EXCEEDED': 'warning',
  'PARTIAL': 'info',
};

export default function SubmissionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ verdict: '', period: '' });

  const load = () => {
    setLoading(true);
    analyticsApi.getSubmissions({ page, ...filters })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  };

  useEffect(load, [page, filters]);

  const submissions = data?.submissions || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">Submission Analytics</h2>
        <p className="text-sm text-[#6b7280]">Your complete Codeforces submission history.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filters.verdict} onChange={e => { setFilters(f => ({ ...f, verdict: e.target.value })); setPage(1); }} className="text-xs py-1.5">
          <option value="">All Verdicts</option>
          <option value="OK">Accepted</option>
          <option value="WRONG_ANSWER">Wrong Answer</option>
          <option value="TIME_LIMIT_EXCEEDED">TLE</option>
          <option value="RUNTIME_ERROR">Runtime Error</option>
        </Select>
        <Select value={filters.period} onChange={e => { setFilters(f => ({ ...f, period: e.target.value })); setPage(1); }} className="text-xs py-1.5">
          <option value="">All Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </Select>
      </div>

      {loading ? <TableSkeleton rows={10} />
        : error ? <ErrorState title="Failed to load submissions" onRetry={load} />
        : !submissions.length ? <EmptyState icon="📋" title="No submissions" description="No submissions found for the selected filters." />
        : (
          <>
            <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2030] text-[#6b7280] uppercase tracking-wide">
                      {['Problem', 'Verdict', 'Language', 'Time', 'Memory', 'Date'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s, i) => (
                      <tr key={s.id || i} className="border-b border-[#1e2030] hover:bg-[#161820] transition-colors">
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="font-medium text-[#e8eaf0] truncate">{s.problemName}</p>
                          <p className="text-[#6b7280]">{s.problemRating ?? '?'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={VERDICT_STATUS[s.verdict] || 'neutral'}>
                            {s.verdict === 'OK' ? 'AC' : s.verdict?.replace(/_/g, ' ') || '—'}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#9ca3c4]">{s.language || '—'}</td>
                        <td className="px-4 py-3 font-mono text-[#9ca3c4]">{s.timeMs ? `${s.timeMs}ms` : '—'}</td>
                        <td className="px-4 py-3 font-mono text-[#9ca3c4]">{s.memoryKb ? `${Math.round(s.memoryKb / 1024)}MB` : '—'}</td>
                        <td className="px-4 py-3 text-[#6b7280]">{formatDateTime(s.createdAt)}</td>
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
