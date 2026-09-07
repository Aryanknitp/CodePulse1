export default function Button({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, className = '', type = 'button', ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366f1] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#6366f1] hover:bg-[#5254cc] text-white',
    secondary: 'bg-[#1a1c2a] hover:bg-[#252840] text-[#e8eaf0] border border-[#1e2030]',
    ghost: 'hover:bg-[#1a1c2a] text-[#9ca3c4]',
    danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white',
    outline: 'border border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-sm px-6 py-3 gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
