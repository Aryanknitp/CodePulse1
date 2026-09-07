import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemsApi } from '../../services/problemsApi.js';
import { ROUTES } from '../../constants/routes.js';
import Tabs from '../../components/common/Tabs.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import { TableSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Select from '../../components/common/Select.jsx';

const PROBLEM_TABS = [
  { value: 'all', label: 'All' },
  { value: 'solved', label: 'Solved' },
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'recommended', label: 'Recommended' },
];

export default function ProblemsPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('rating');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    const params = { page, sortBy, search, filter: tab === 'all' ? '' : tab };
    if (tab === 'recommended') {
      navigate(ROUTES.PROBLEMS_RECOMMENDED);
      return;
    }
    problemsApi.getProblems(params)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  };

  useEffect(load, [page, tab, sortBy]);

  const handleSearch = (q) => { setSearch(q); setPage(1); load(); };

  const problems = data?.problems || [];

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">Problem Explorer</h2>
        <p className="text-sm text-[#6b7280]">Browse and search Codeforces problems.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Tabs tabs={PROBLEM_TABS} active={tab} onChange={t => { setTab(t); setPage(1); }} />
        <div className="flex gap-2 ml-auto">
          <SearchInput onSearch={handleSearch} placeholder="Search problems…" className="w-48" />
          <Select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs py-1.5">
            <option value="rating">Sort: Rating</option>
            <option value="name">Sort: Name</option>
            <option value="date">Sort: Date</option>
          </Select>
        </div>
      </div>

      {loading ? <TableSkeleton rows={10} />
        : error ? <ErrorState title="Failed to load problems" onRetry={load} />
        : !problems.length ? <EmptyState icon="📝" title="No problems found" description="No problems match your current filters." />
        : (
          <>
            <div className="bg-[#111218] border border-[#1e2030] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2030] text-[#6b7280] uppercase tracking-wide">
                      {['Problem', 'Rating', 'Tags', 'Status', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((p, i) => (
                      <tr key={p.id || i} className="border-b border-[#1e2030] hover:bg-[#161820] transition-colors">
                        <td className="px-4 py-3 max-w-[200px]">
                          <p className="font-medium text-[#e8eaf0] truncate">{p.name}</p>
                          <p className="text-[#6b7280]">{p.contestId}{p.index}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-[#9ca3c4]">{p.rating ?? '?'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {p.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[10px] bg-[#6366f1]/10 text-[#818cf8] px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.solved ? 'success' : 'neutral'}>{p.solved ? 'Solved' : 'Unsolved'}</StatusBadge>
                        </td>
                        <td className="px-4 py-3">
                          <a href={p.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#6366f1] hover:text-[#818cf8] flex items-center gap-1">
                            Open ↗
                          </a>
                        </td>
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
