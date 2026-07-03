import { Skeleton } from '@/components/Skeleton'

const ROWS = Array.from({ length: 8 }, (_, i) => i)

/** Mirrors ConversationRow's grid and vertical rhythm so there is no shift on load. */
export function QueueSkeleton() {
  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface">
      {ROWS.map((i) => (
        <div key={i} className="relative flex items-center gap-4 py-3 pl-5 pr-4">
          <Skeleton className="absolute inset-y-2 left-0 w-[3px] rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="flex h-6 items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <div className="mt-1 flex h-7 items-center gap-2">
              <Skeleton className="h-5 w-28 rounded-chip" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="hidden h-4 w-20 sm:block" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex w-24 flex-col items-end gap-1">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
