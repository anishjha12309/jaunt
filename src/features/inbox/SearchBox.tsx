import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

interface SearchBoxProps {
  value: string
  onChange: (q: string) => void
}

const DEBOUNCE_MS = 250

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  const [expanded, setExpanded] = useState(() => value !== '')
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the draft in sync when q is cleared/changed elsewhere (e.g. Clear filters).
  useEffect(() => setDraft(value), [value])

  // Debounce the draft into the URL-backed query.
  useEffect(() => {
    if (draft === value) return
    const id = window.setTimeout(() => onChange(draft), DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [draft, value, onChange])

  // `/` focuses search from anywhere (unless already typing in a field).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !isTypingTarget(e.target) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setExpanded(true)
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Visible whenever the user opened it or there's a query to show.
  const isOpen = expanded || draft !== ''

  function collapseIfEmpty() {
    if (draft === '') setExpanded(false)
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setDraft('')
      onChange('')
      setExpanded(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="Search conversations"
        onClick={() => {
          setExpanded(true)
          inputRef.current?.focus()
        }}
        className={cn(
          'grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:text-ink',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
          isOpen && 'text-ink',
        )}
      >
        <SearchIcon />
      </button>
      <input
        ref={inputRef}
        type="text"
        value={draft}
        placeholder="Search customer or subject"
        aria-label="Search customer or subject"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onInputKeyDown}
        onBlur={collapseIfEmpty}
        className={cn(
          'bg-transparent text-[13px] text-ink outline-none transition-all placeholder:text-muted/70',
          isOpen ? 'w-44 opacity-100' : 'w-0 opacity-0',
        )}
      />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
