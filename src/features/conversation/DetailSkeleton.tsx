import { Skeleton } from '@/components/Skeleton'

/** Mirrors the detail layout (header + transcript + sidebar) so load → content doesn't jump. */
export function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          {['w-[70%]', 'w-[55%]', 'w-[80%]', 'w-[60%]'].map((width, index) => (
            <div key={index} className={index % 2 === 1 ? 'flex justify-end' : ''}>
              <Skeleton className={`h-16 ${width}`} />
            </div>
          ))}
        </div>
        <div className="w-full shrink-0 space-y-4 lg:w-80">
          <Skeleton className="h-52 w-full rounded-card" />
          <Skeleton className="h-48 w-full rounded-card" />
        </div>
      </div>
    </div>
  )
}
