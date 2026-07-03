import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import type { Message, MessageAuthor } from '@/api/types'

interface TranscriptProps {
  messages: Message[]
  customerName: string
}

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  month: 'short',
  day: 'numeric',
}

function formatAt(at: string): string {
  return new Date(at).toLocaleString('en-US', TIME_FORMAT)
}

function authorLabel(author: MessageAuthor, customerName: string): string {
  if (author === 'ai') return 'AI'
  if (author === 'agent') return 'Agent'
  return customerName
}

const BUBBLE: Record<MessageAuthor, string> = {
  customer: 'bg-ink/[0.05] text-ink',
  ai: 'border border-hairline bg-surface text-ink',
  agent: 'bg-blue/10 text-ink',
}

export function Transcript({ messages, customerName }: TranscriptProps) {
  const endRef = useRef<HTMLLIElement>(null)

  // Land on the most recent message on open — the exchange that triggered the escalation.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [])

  return (
    <ol className="flex flex-col gap-4">
      {messages.map((message, index) => {
        const isAgent = message.author === 'agent'
        return (
          <li
            key={message.id}
            ref={index === messages.length - 1 ? endRef : undefined}
            className={cn('flex', isAgent ? 'justify-end' : 'justify-start')}
          >
            <div className="max-w-[82%]">
              <div
                className={cn(
                  'mb-1 flex items-baseline gap-2',
                  isAgent ? 'justify-end' : 'justify-start',
                )}
              >
                <span className="font-mono-label text-muted">
                  {authorLabel(message.author, customerName)}
                </span>
                <time dateTime={message.at} className="font-mono text-[11px] text-muted">
                  {formatAt(message.at)}
                </time>
              </div>
              <div
                className={cn(
                  'whitespace-pre-wrap rounded-card px-4 py-2.5 text-body leading-relaxed',
                  BUBBLE[message.author],
                )}
              >
                {message.text}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
