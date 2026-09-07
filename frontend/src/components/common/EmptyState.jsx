import Button from './Button.jsx';

export default function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="text-[#6b7280] mb-4 text-4xl">{icon}</div>
      )}
      <h3 className="text-base font-semibold text-[#e8eaf0] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#6b7280] max-w-sm mb-6">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
}
