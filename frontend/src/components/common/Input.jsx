export default function Input({
  label, error, hint, prefix, suffix, className = '', wrapperClassName = '', ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label className="text-sm font-medium text-[#e8eaf0]">
          {label}
          {props.required && <span className="text-[#ef4444] ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-[#6b7280] pointer-events-none">{prefix}</span>
        )}
        <input
          className={`
            w-full bg-[#111218] border rounded-md px-3 py-2 text-sm text-[#e8eaf0]
            placeholder:text-[#6b7280] transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent
            ${error ? 'border-[#ef4444]' : 'border-[#1e2030] hover:border-[#252840]'}
            ${prefix ? 'pl-9' : ''}
            ${suffix ? 'pr-9' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-[#6b7280]">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-[#ef4444]" role="alert">{error}</p>}
      {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
    </div>
  );
}
