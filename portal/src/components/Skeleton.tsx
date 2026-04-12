interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`.trim()} />
}

export function StatSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </div>
  )
}
