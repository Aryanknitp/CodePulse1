import { NavLink, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSync } from '../../hooks/useSync.js';

const NAV = [
  {
    label: null,
    items: [{ to: ROUTES.DASHBOARD, icon: GridIcon, label: 'Dashboard' }],
  },
  {
    label: 'Analytics',
    items: [
      { to: ROUTES.ANALYTICS, icon: BarChartIcon, label: 'Overview' },
      { to: ROUTES.ANALYTICS_RATING, icon: TrendIcon, label: 'Rating' },
      { to: ROUTES.ANALYTICS_DIFFICULTY, icon: LayersIcon, label: 'Difficulty' },
      { to: ROUTES.ANALYTICS_TOPICS, icon: TagIcon, label: 'Topics' },
      { to: ROUTES.ANALYTICS_SUBMISSIONS, icon: CodeIcon, label: 'Submissions' },
      { to: ROUTES.ANALYTICS_CONTESTS, icon: TrophyIcon, label: 'Contests' },
    ],
  },
  {
    label: 'Problems',
    items: [
      { to: ROUTES.PROBLEMS, icon: ListIcon, label: 'All Problems' },
      { to: ROUTES.PROBLEMS_RECOMMENDED, icon: StarIcon, label: 'Recommended' },
      { to: ROUTES.PROBLEMS_HISTORY, icon: ClockIcon, label: 'History' },
    ],
  },
  {
    label: 'Training',
    items: [
      { to: ROUTES.DAILY_PRACTICE, icon: CalendarIcon, label: 'Daily Practice' },
      { to: ROUTES.AI_COACH, icon: BotIcon, label: 'AI Coach' },
      { to: ROUTES.ROADMAP, icon: MapIcon, label: 'DSA Roadmap' },
      { to: ROUTES.PROGRESS, icon: ActivityIcon, label: 'Progress' },
    ],
  },
  {
    label: null,
    items: [
      { to: ROUTES.CONTESTS, icon: TrophyIcon, label: 'Contests' },
      { to: ROUTES.PROFILE, icon: UserIcon, label: 'Profile' },
      { to: ROUTES.SETTINGS, icon: SettingsIcon, label: 'Settings' },
    ],
  },
];

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
          ? 'bg-[#6366f1]/15 text-[#818cf8] font-medium'
          : 'text-[#9ca3c4] hover:text-[#e8eaf0] hover:bg-[#1a1c2a]'
        }`
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ onClose }) {
  const { user, logout, codeforcesConnected } = useAuth();
  const { syncing, syncNow } = useSync();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0e14] border-r border-[#1e2030] w-64">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#1e2030]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#e8eaf0] tracking-tight">CF Insights</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((section, i) => (
          <div key={i}>
            {section.label && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4b5563] px-3 mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavItem key={item.to} {...item} onClick={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1e2030] px-3 py-3 space-y-2">
        {/* Sync status */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${codeforcesConnected ? 'bg-[#10b981]' : 'bg-[#6b7280]'}`} />
            <span className="text-xs text-[#6b7280]">
              {codeforcesConnected ? user?.codeforcesHandle : 'Not connected'}
            </span>
          </div>
          {codeforcesConnected && (
            <button
              onClick={syncNow}
              disabled={syncing}
              className="text-xs text-[#6366f1] hover:text-[#818cf8] disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : 'Sync'}
            </button>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-[#6366f1]/20 flex items-center justify-center text-xs font-semibold text-[#818cf8] shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#e8eaf0] truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-[#6b7280] truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-[#6b7280] hover:text-[#ef4444] transition-colors" aria-label="Logout">
            <LogoutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons
function GridIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>; }
function BarChartIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>; }
function TrendIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>; }
function LayersIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>; }
function TagIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>; }
function CodeIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>; }
function TrophyIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 21h8m-4-4v4m0 0H8m4 0h4M5 7H3a2 2 0 01-2-2V3h4v2m14 2h2a2 2 0 002-2V3h-4v2M5 7v6a7 7 0 0014 0V7H5z" /></svg>; }
function ListIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>; }
function StarIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>; }
function ClockIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function CalendarIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
function BotIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
function MapIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>; }
function ActivityIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>; }
function UserIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function SettingsIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function LogoutIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>; }
