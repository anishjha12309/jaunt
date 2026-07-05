# Architecture

## Stack
Vite + React 18 + TypeScript (strict) · Tailwind v4 (`@theme` tokens) · TanStack Query v5
· React Router v7 · MSW v2 · Vitest + RTL · oxlint.

## Folders
- `src/api/` — typed fetch client, query keys, domain types
- `src/mocks/` — MSW handlers, seeded data (42 conversations), failure flag
- `src/features/inbox/` — queue, ranking, filters, summary strip
- `src/features/conversation/` — detail, transcript, handoff card, action bar
- `src/features/actions/` — optimistic triage mutations, snooze, failure toggle
- `src/features/shortcuts/` — keyboard system + shortcuts overlay
- `src/components/`, `src/lib/`, `src/styles/` — primitives, pure helpers, tokens

## State
- Server state lives only in TanStack Query. Keys: `['conversations', filters]` and
  `['conversation', id]`. Priority is derived per render, never stored.
- Filters and search live in the URL (`useSearchParams`) — shareable, survive reload.
- Selection index and shortcut handlers live in a context; nothing else is global.
- Mutations are optimistic: `onMutate` snapshots + writes the cache, `onError` restores
  it and toasts a Retry, `onSettled` invalidates. Undo fires the inverse mutation.

## Mock API (MSW v2, 200–500ms latency on every handler)
- `GET /api/conversations?tab&status&q` — filtered list + summary + tab counts
- `GET | PATCH /api/conversations/:id` — read / triage action
- `GET | POST /api/dev/failures` — the failure simulator (PATCH → 500 while on)

MSW is enabled in dev **and** the preview/production build so the hosted demo works with
no backend. `scoreConversation` / `bucketFor` are pure functions and unit-tested.
