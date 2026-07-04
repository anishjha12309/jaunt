# Conversation Inbox

A triage inbox for a CX agent: open a full queue and know, within seconds, what to
act on first. Conversations are ranked by a priority score (SLA urgency, sentiment,
CSAT risk, tier, wait time), every triage action is optimistic and reversible, and the
whole flow is keyboard-driven. It's a triage tool, not a chat client — agents reply in
their existing tool (see [DECISIONS](docs/DECISIONS.md)).

![demo](docs/demo.gif) <!-- TODO: record a ~10s GIF: rank → open → resolve → undo -->

## Run it

```bash
npm install     # install deps
npm run dev     # http://localhost:5173  (mock API runs in-browser via MSW)
npm test        # priority + optimistic-mutation tests
```

Desktop-only (≥ 768px). All data is a mock (MSW) — no backend, no env vars.

## Keyboard

| Key | Action | Key | Action |
| --- | --- | --- | --- |
| `j` `k` `↑` `↓` | Move selection | `s` | Snooze menu |
| `Enter` | Open conversation | `u` | Undo last action |
| `Esc` | Back / clear / close | `/` | Focus search |
| `a` | Assign to me | `1`–`4` | Switch tab |
| `r` | Resolve | `?` | Shortcuts overlay |

Flip the failure simulator (the dot in the nav) to watch a write roll back cleanly.

## More

- [ARCHITECTURE](docs/ARCHITECTURE.md) — stack, folders, state strategy, mock API
- [DECISIONS](docs/DECISIONS.md) — the sharp calls and the cuts
- [LIMITATIONS](docs/LIMITATIONS.md) — honest gaps

Approx time spent: ~4–6 hours.
