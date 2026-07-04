# Limitations

Honest gaps — what a real build would tackle next.

- **No real backend.** All data is a seeded in-memory MSW mock; writes reset on reload.
  MSW is intentionally enabled in the production/preview build so the hosted demo works —
  a real deploy would swap it for a live API.
- **No real-time.** The queue re-ranks on a 30s stale window and a 1s SLA clock, not on
  push; there are no websockets. New escalations surface on refetch, not instantly.
- **Single agent.** "Mine" and "Assign to me" resolve to one hard-coded agent id; there
  is no auth, no multi-agent presence, no multi-tenant.
- **No list virtualization.** 42 rows render fine; a real queue of thousands would need
  windowing. Left out to keep the code readable.
- **Failure flag is module state.** The simulator toggle lives in the mock layer's
  memory, so a full page reload resets it to off.
- **Undo is best-effort.** Undo fires the inverse action; if that write itself fails it
  toasts an error rather than retrying forever.
- **Not internationalized.** Copy, dates, and number formats are en-US only.
