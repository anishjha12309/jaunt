# Decisions

Where a call wasn't obvious, the smaller, sharper option won.

## Triage tool, not a chat client
The job is "show me what needs me now, let me act in one keystroke." A reply composer
would dilute that into a second-rate chat client. Instead we surface *why* each item
escalated and make the three actions instant; agents reply in their existing tool.
This is the core cut everything else follows from.

## No reply composer / bulk actions / settings
Out of scope by the same logic — they serve a different job and would bloat the surface
past what a person can defend live.

## Ranking, not recency
Conversations sort by a priority score, never by arrival time. A breached SLA
contributes the full urgency term (stale or fresh), so it never sinks below an item
merely trending toward a breach — the agent always sees the true top of the pile.

## Undo, not confirm
Every action applies immediately and offers a 5-second Undo rather than blocking behind
a confirm dialog. Triage is high-volume; a confirm would tax every keystroke. Failed
writes roll back automatically with a Retry toast, so "instant" is never risky.

## Desktop-first, but responsive
An agent's primary surface is a desk, so the layout is tuned for 768–1440px and up and
the keyboard model assumes it. But a broken phone render reads as unfinished, so the core
flow now reflows down to ~360px: the nav's tab strip scrolls horizontally, queue rows drop
their pointer-only quick-actions and lower-signal columns (CSAT, sentiment), and the detail
view stacks its transcript above the sidebar. Touch users tap a row to open and act.

## MSW everywhere
The mock layer runs in the browser in dev and in the built demo, so the app is fully
interactive with no backend — including the failure-simulator rollback path.

## Cut three.js and GSAP, kept Lenis
Phase 8 originally shipped a three.js ambient point-field with scroll-linked parallax
plus GSAP for stagger/collapse/toast/count-up tweens. The three.js parallax read as janky
cursor-drag rather than "felt not watched," and GSAP added a dependency + failure surface
(lazy-chunk error boundary, `matchMedia` reduced-motion plumbing) for effects a few lines
of Tailwind and `@keyframes` cover just as well. Cut both; Lenis smooth-scroll stays since
it wasn't the complaint. Row collapse is now a CSS `grid-template-rows` transition, detail
entrance and toasts are CSS keyframes/transitions, and the summary strip renders its
numbers directly instead of counting up.
