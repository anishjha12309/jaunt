import type { ReactNode } from 'react'
import { GlassNav } from '@/components/GlassNav'

interface PageShellProps {
  title: string
  children: ReactNode
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}

export function PageShell({ title, children }: PageShellProps) {
  const today = new Date().toLocaleDateString('en-US', DATE_FORMAT)

  return (
    <div className="min-h-screen bg-paper text-ink">
      <GlassNav />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <header className="mb-8 flex items-baseline justify-between">
          <h1 className="text-page-title font-semibold tracking-tight">{title}</h1>
          <span className="font-mono-label text-muted">{today}</span>
        </header>
        {children}
        <footer className="mt-16 border-t border-hairline pt-4">
          <p className="font-mono-label text-muted">
            Demo data · Failure simulator in nav
          </p>
        </footer>
      </main>
    </div>
  )
}
