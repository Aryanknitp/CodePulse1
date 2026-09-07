import Button from './Button.jsx';

export default function ErrorState({ title, description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-[#ef4444]/10 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[#e8eaf0] mb-2">{title || 'Something went wrong'}</h3>
      {description && <p className="text-sm text-[#6b7280] max-w-sm mb-6">{description}</p>}
      {onRetry && <Button onClick={onRetry} variant="secondary">Try Again</Button>}
    </div>
  );
}
