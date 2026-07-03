import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface ShortcutsOverlayProps {
  onClose: () => void
}

interface Shortcut {
  keys: ReactNode
  label: string
}

interface Group {
  title: string
  items: Shortcut[]
}

const Cap = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-panel-text">
    {children}
  </kbd>
)

const GROUPS: Group[] = [
  {
    title: 'Navigate',
    items: [
      { keys: <><Cap>j</Cap> <Cap>↓</Cap></>, label: 'Next conversation' },
      { keys: <><Cap>k</Cap> <Cap>↑</Cap></>, label: 'Previous conversation' },
      { keys: <Cap>Enter</Cap>, label: 'Open selected' },
      { keys: <Cap>Esc</Cap>, label: 'Back / clear / close' },
    ],
  },
  {
    title: 'Act',
    items: [
      { keys: <Cap>a</Cap>, label: 'Assign to me' },
      { keys: <Cap>r</Cap>, label: 'Resolve' },
      { keys: <Cap>s</Cap>, label: 'Snooze' },
      { keys: <Cap>u</Cap>, label: 'Undo last action' },
    ],
  },
  {
    title: 'Find',
    items: [
      { keys: <Cap>/</Cap>, label: 'Search' },
      { keys: <><Cap>1</Cap>–<Cap>4</Cap></>, label: 'Switch tab' },
      { keys: <Cap>?</Cap>, label: 'Toggle this help' },
    ],
  },
]

export function ShortcutsOverlay({ onClose }: ShortcutsOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Trap Tab within the dialog and restore focus to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const focusables = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button, [tabindex="0"]') ?? [])

    focusables()[0]?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      opener?.focus?.()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-card bg-panel p-6 text-panel-text shadow-[0_16px_48px_rgb(27_27_24_/_0.4)]"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-section font-semibold tracking-tight">Keyboard shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts"
            className="-mr-1 grid h-8 w-8 place-items-center rounded-md text-panel-text/70 transition-colors hover:bg-white/10 hover:text-panel-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <p className="font-mono-label text-panel-text/50">{group.title}</p>
              <dl className="mt-2 space-y-2">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <dt className="text-body text-panel-text/90">{item.label}</dt>
                    <dd className="flex shrink-0 items-center gap-1">{item.keys}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
