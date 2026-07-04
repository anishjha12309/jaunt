import type { ReactNode } from 'react'
import { AppFooter } from '@/app/AppFooter'
import { GlassNav } from '@/components/GlassNav'
import { FailureToggle } from '@/features/actions/FailureToggle'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import { useFocusOnMount } from '@/lib/useFocusOnMount'

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
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  useDocumentTitle(title)

  return (
    <div className="min-h-screen bg-paper text-ink">
      <GlassNav tabs={navTabs} search={navSearch} failureSlot={<FailureToggle />} />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-28 text-page-title font-semibold tracking-tight focus:outline-none"
          >
            {title}
          </h1>
          <div className="flex items-center gap-4">
            {titleAside}
            <span className="font-mono-label text-muted">{today}</span>
          </div>
        </header>
        {children}
        <AppFooter />
      </main>
    </div>
  )
}
