// Pulsing placeholder blocks shown while content loads.
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-300/60 ${className}`} />
}

// Placeholder matching the shape of an event card in the events grid.
export function EventCardSkeleton() {
  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
      <Skeleton className="h-20 rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}
