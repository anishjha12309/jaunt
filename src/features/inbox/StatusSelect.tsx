import type { ConversationStatus } from '@/api/types'

type StatusValue = ConversationStatus | 'all'

interface StatusSelectProps {
  value: StatusValue
  onChange: (status: StatusValue) => void
}

const OPTIONS: ReadonlyArray<{ value: StatusValue; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'snoozed', label: 'Snoozed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All statuses' },
]

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="font-mono-label text-muted">Status</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as StatusValue)}
        className="rounded-chip border border-hairline bg-surface px-2.5 py-1.5 text-[13px] text-ink shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}
