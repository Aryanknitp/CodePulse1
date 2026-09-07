export function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-[#1a1c2a] animate-pulse rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-lg p-4 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-lg p-4 space-y-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function ProblemCardSkeleton() {
  return (
    <div className="bg-[#111218] border border-[#1e2030] rounded-lg p-4 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
