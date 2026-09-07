export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-[#1e2030] ${className}`} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap
            ${active === tab.value
              ? 'border-[#6366f1] text-[#6366f1]'
              : 'border-transparent text-[#6b7280] hover:text-[#9ca3c4] hover:border-[#252840]'}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
