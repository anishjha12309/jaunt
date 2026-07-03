import { CURRENT_AGENT_ID } from '@/mocks/data'

/** `agent-nora-quinn` → `Nora Quinn`. */
export function agentName(id: string): string {
  return id
    .replace(/^agent-/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** `agent-nora-quinn` → `NQ`. */
export function agentInitials(id: string): string {
  const parts = id.replace(/^agent-/, '').split('-')
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return (first + last).toUpperCase()
}

export function isMe(id: string | null): boolean {
  return id === CURRENT_AGENT_ID
}
