import { Link } from 'react-router'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { EmptyState } from '@/components/EmptyState'
import { Skeleton } from '@/components/Skeleton'
import { PageShell } from '@/app/PageShell'

/**
 * Phase 2 placeholder body: exercises every primitive so the shell, nav, and
 * focus rings are verifiable. The real ranked queue lands in Phase 3.
 */
export function QueuePage() {
  return (
    <PageShell title="Escalations">
      <section className="space-y-8">
        <Preview label="Buttons">
          <Button variant="primary">Assign to me</Button>
          <Button variant="ghost">Snooze</Button>
          <Button variant="danger">Resolve</Button>
          <Button variant="primary" loading>
            Saving
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
        </Preview>

        <Preview label="Badges & chips">
          <Badge tone="blue">Enterprise</Badge>
          <Badge tone="neutral">Growth</Badge>
          <Badge tone="ok">Resolved</Badge>
          <Badge tone="snoozed">Snoozed</Badge>
          <Chip tone="critical" lightning>
            Angry customer
          </Chip>
          <Chip tone="warn" lightning>
            Low CSAT
          </Chip>
          <Chip tone="blue" lightning>
            AI low confidence
          </Chip>
        </Preview>

        <Preview label="Skeleton">
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Preview>

        <EmptyState
          title="Queue clear"
          body="Nothing needs you right now. New escalations will appear here."
          action={
            <Link to="/c/conv-001">
              <Button variant="ghost">Open a sample conversation</Button>
            </Link>
          }
        />
      </section>
    </PageShell>
  )
}

function Preview({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono-label mb-3 text-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}
