export type CountdownTone = 'critical' | 'warn' | 'muted'

export interface Countdown {
  text: string
  tone: CountdownTone
  /** true when < 15 minutes remain (or already breached) — drives the pulse. */
  urgent: boolean
  breached: boolean
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

/**
 * SLA countdown for the queue row. Under an hour it counts down in MM:SS so the
 * agent feels the clock; past an hour it relaxes to `Hh Mm`; once breached it
 * flips to a red `BREACHED +Nm` that grows with the overrun.
 */
export function formatCountdown(slaDueAt: string, now: number): Countdown {
  const msLeft = new Date(slaDueAt).getTime() - now
  const minutesLeft = msLeft / 60_000

  if (msLeft <= 0) {
    const overdueMin = Math.floor(-minutesLeft)
    return { text: `BREACHED +${overdueMin}m`, tone: 'critical', urgent: true, breached: true }
  }

  const urgent = minutesLeft < 15
  const tone: CountdownTone = urgent ? 'critical' : minutesLeft < 60 ? 'warn' : 'muted'

  let text: string
  if (minutesLeft < 60) {
    const totalSeconds = Math.floor(msLeft / 1000)
    text = `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`
  } else {
    const totalMinutes = Math.floor(minutesLeft)
    text = `${Math.floor(totalMinutes / 60)}h ${pad(totalMinutes % 60)}m`
  }

  return { text, tone, urgent, breached: false }
}

/** Compact "how long this has been waiting" string, e.g. `45m`, `3h 12m`, `2d 4h`. */
export function formatWaited(createdAt: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60_000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}
