import type { ReactNode } from 'react'
import { GlassNav } from '@/components/GlassNav'

interface PageShellProps {
  title: string
  children: ReactNode
  navTabs?: ReactNode
  navSearch?: ReactNode
  titleAside?: ReactNode
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}

export function PageShell({ title, children, navTabs, navSearch, titleAside }: PageShellProps) {
  const today = new Date().toLocaleDateString('en-US', DATE_FORMAT)

  return (
    <div className="min-h-screen bg-paper text-ink">
      <GlassNav tabs={navTabs} search={navSearch} />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-page-title font-semibold tracking-tight">{title}</h1>
          <div className="flex items-center gap-4">
            {titleAside}
            <span className="font-mono-label text-muted">{today}</span>
          </div>
        </header>
        {children}
        <footer className="mt-16 border-t border-hairline pt-4">
          <p className="font-mono-label text-muted">Demo data · Failure simulator in nav</p>
        </footer>
      </main>
    </div>
  )
}
