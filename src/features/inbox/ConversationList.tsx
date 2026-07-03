import { ConversationRow } from '@/features/inbox/ConversationRow'
import type { RankedConversation } from '@/features/inbox/useQueue'

interface ConversationListProps {
  ranked: RankedConversation[]
}

export function ConversationList({ ranked }: ConversationListProps) {
  return (
    <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface">
      {ranked.map(({ conversation, bucket }) => (
        <li key={conversation.id}>
          <ConversationRow conversation={conversation} bucket={bucket} />
        </li>
      ))}
    </ul>
  )
}
