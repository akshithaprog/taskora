export const Skeleton = ({ className = "" }) => <div className={`animate-pulse rounded-lg bg-hover ${className}`} />;

export function TaskSkeletons({ count = 4 }) {
  return (
    <div className="space-y-3" aria-label="Loading tasks">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel flex items-center gap-4 p-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="hidden h-6 w-16 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

export const StatSkeletons = () => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
  </div>
);
