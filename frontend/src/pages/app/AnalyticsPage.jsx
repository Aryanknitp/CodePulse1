import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../services/analyticsApi.js';
import { ROUTES } from '../../constants/routes.js';
import Tabs from '../../components/common/Tabs.jsx';
import { StatCardSkeleton, ChartSkeleton } from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import { getRatingColor, getRatingTitle } from '../../utils/formatRating.js';

const ANALYTICS_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'rating', label: 'Rating' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'topics', label: 'Topics' },
  { value: 'submissions', label: 'Submissions' },
  { value: 'contests', label: 'Contests' },
];

const TAB_ROUTES = {
  overview: ROUTES.ANALYTICS,
  rating: ROUTES.ANALYTICS_RATING,
  difficulty: ROUTES.ANALYTICS_DIFFICULTY,
  topics: ROUTES.ANALYTICS_TOPICS,
  submissions: ROUTES.ANALYTICS_SUBMISSIONS,
  contests: ROUTES.ANALYTICS_CONTESTS,
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    if (tab === 'overview') return;
    navigate(TAB_ROUTES[tab]);
  };

  useEffect(() => {
    setLoading(true);
    analyticsApi.getOverview()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e); setLoading(false); });
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#e8eaf0]">Analytics</h2>
        <p className="text-sm text-[#6b7280]">Your complete Codeforces performance overview.</p>
      </div>

      <Tabs tabs={ANALYTICS_TABS} active={activeTab} onChange={t => { setActiveTab(t); handleTabChange(t); }} />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <ChartSkeleton />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load analytics" onRetry={() => window.location.reload()} />
      ) : (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Current Rating', value: data?.rating, color: getRatingColor(data?.rating), sub: data?.rating ? getRatingTitle(data.rating) : '—' },
              { label: 'Problems Solved', value: data?.solvedCount ?? '—', sub: 'total solved' },
              { label: 'Acceptance Rate', value: data?.acceptanceRate ? `${data.acceptanceRate}%` : '—', sub: `${data?.submissionCount ?? 0} submissions` },
              { label: 'Average Difficulty', value: data?.avgDifficulty ?? '—', sub: 'rating of solved problems' },
            ].map(s => (
              <div key={s.label} className="bg-[#111218] border border-[#1e2030] rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-2">{s.label}</p>
                <p className="text-xl font-bold font-mono" style={{ color: s.color || '#e8eaf0' }}>{s.value}</p>
                <p className="text-[11px] text-[#6b7280] mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Quick nav to sub-pages */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Rating Analysis', desc: 'Rating history, changes, and contests', route: ROUTES.ANALYTICS_RATING, color: '#6366f1' },
              { label: 'Difficulty Breakdown', desc: 'Problems by difficulty band', route: ROUTES.ANALYTICS_DIFFICULTY, color: '#8b5cf6' },
              { label: 'Topic Performance', desc: 'Strength and weakness by DSA topic', route: ROUTES.ANALYTICS_TOPICS, color: '#6366f1' },
              { label: 'Submission History', desc: 'All submissions with verdicts', route: ROUTES.ANALYTICS_SUBMISSIONS, color: '#8b5cf6' },
              { label: 'Contest Performance', desc: 'All contests with rank and rating', route: ROUTES.ANALYTICS_CONTESTS, color: '#6366f1' },
            ].map(card => (
              <button key={card.route} onClick={() => navigate(card.route)}
                className="bg-[#111218] border border-[#1e2030] hover:border-[#252840] rounded-xl p-4 text-left transition-colors group">
                <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: card.color + '20' }}>
                  <svg className="w-4 h-4" style={{ color: card.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#e8eaf0] mb-1">{card.label}</p>
                <p className="text-xs text-[#6b7280]">{card.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
