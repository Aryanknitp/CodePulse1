import { useState, useCallback } from 'react';

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function SearchInput({ onSearch, placeholder = 'Search...', className = '' }) {
  const [value, setValue] = useState('');

  const debouncedSearch = useCallback(debounce(onSearch, 350), [onSearch]);

  const handleChange = (e) => {
    setValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-[#111218] border border-[#1e2030] rounded-md pl-9 pr-3 py-2 text-sm text-[#e8eaf0] placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent hover:border-[#252840] transition-colors"
      />
    </div>
  );
}
