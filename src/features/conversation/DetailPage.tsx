import { Link, useParams } from 'react-router'
import { Button } from '@/components/Button'
import { PageShell } from '@/app/PageShell'

/**
 * Phase 2 placeholder: confirms the /c/:id route mounts and reads the id param.
 * The transcript, handoff card, sidebar, and action bar arrive in Phase 5.
 */
export function DetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <PageShell title="Conversation">
      <p className="text-body text-muted">
        Detail view for <span className="font-mono text-ink">{id}</span> — built in Phase 5.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="ghost">← Back to queue</Button>
        </Link>
      </div>
    </PageShell>
  )
}
