import { Skeleton, StatSkeleton } from '@/components/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-36" />
      <StatSkeleton />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[28rem]" />
        <Skeleton className="h-[28rem]" />
      </div>
    </div>
  )
}
