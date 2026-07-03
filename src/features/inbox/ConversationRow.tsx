import { Link } from 'react-router'
import { Badge } from '@/components/Badge'
import { Chip } from '@/components/Chip'
import { cn } from '@/lib/cn'
import type { Bucket } from '@/lib/priority'
import type { Conversation } from '@/api/types'
import { agentInitials, agentName, isMe } from '@/features/inbox/agents'
import {
  REASON_LABEL,
  REASON_TONE,
  SENTIMENT_DOT,
  SENTIMENT_LABEL,
  TIER_LABEL,
} from '@/lib/labels'
import { RowTiming } from '@/features/inbox/RowTiming'

interface ConversationRowProps {
  conversation: Conversation
  bucket: Bucket
  selected?: boolean
}

const BUCKET_RAIL: Record<Bucket, string> = {
  critical: 'bg-critical',
  high: 'bg-warn',
  medium: 'bg-blue',
  low: 'bg-muted/40',
}

function csatTone(csat: number): string {
  if (csat <= 2) return 'text-critical'
  if (csat === 3) return 'text-warn'
  return 'text-ok'
}

export function ConversationRow({ conversation, bucket, selected = false }: ConversationRowProps) {
  const { customer, subject, escalation, assigneeId } = conversation

  return (
    <Link
      to={`/c/${conversation.id}`}
      data-selected={selected || undefined}
      className={cn(
        'group relative flex items-center gap-4 py-3 pl-5 pr-4 outline-none transition-colors',
        'hover:bg-ink/[0.03] focus-visible:bg-ink/[0.03]',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue',
        selected && 'bg-[var(--color-selected-wash)]',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-2 left-0 w-[3px] rounded-full',
          selected ? 'bg-blue' : BUCKET_RAIL[bucket],
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-medium text-ink">{customer.name}</span>
          <Badge tone={customer.tier === 'enterprise' ? 'blue' : 'neutral'}>
            {TIER_LABEL[customer.tier]}
          </Badge>
          <span className="truncate text-[13px] text-muted">{customer.company}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Chip tone={REASON_TONE[escalation.reason]} lightning>
            {REASON_LABEL[escalation.reason]}
          </Chip>
          <span className="truncate text-body text-muted">{subject}</span>
        </div>
      </div>

      <div className="hidden items-center gap-1.5 sm:flex" title={SENTIMENT_LABEL[escalation.sentiment]}>
        <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', SENTIMENT_DOT[escalation.sentiment])} />
        <span className="text-[12px] text-muted">{SENTIMENT_LABEL[escalation.sentiment]}</span>
      </div>

      {escalation.csat !== null && (
        <span className={cn('font-mono text-[11px] tabular-nums', csatTone(escalation.csat))}>
          CSAT {escalation.csat}
        </span>
      )}

      <Assignee assigneeId={assigneeId} />

      <div className="w-24 shrink-0">
        <RowTiming slaDueAt={conversation.slaDueAt} createdAt={conversation.createdAt} />
      </div>
    </Link>
  )
}

function Assignee({ assigneeId }: { assigneeId: string | null }) {
  if (!assigneeId) {
    return (
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-dashed border-hairline text-[11px] text-muted"
        title="Unassigned"
        aria-label="Unassigned"
      >
        —
      </span>
    )
  }
  return (
    <span
      className={cn(
        'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-medium',
        isMe(assigneeId) ? 'bg-blue text-white' : 'bg-ink/10 text-ink',
      )}
      title={isMe(assigneeId) ? `${agentName(assigneeId)} (you)` : agentName(assigneeId)}
      aria-label={`Assigned to ${agentName(assigneeId)}`}
    >
      {agentInitials(assigneeId)}
    </span>
  )
}
