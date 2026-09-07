export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-[#e8eaf0]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#6b7280]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
