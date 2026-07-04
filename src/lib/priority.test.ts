import { describe, expect, it } from 'vitest'
import { bucketFor, scoreConversation } from '@/lib/priority'
import { makeConversation } from '@/test/factories'

const NOW = 1_700_000_000_000
const at = (offsetMinutes: number) => new Date(NOW + offsetMinutes * 60_000).toISOString()

describe('bucketFor', () => {
  it('maps scores to buckets at the exact thresholds', () => {
    expect(bucketFor(70)).toBe('critical')
    expect(bucketFor(69.9)).toBe('high')
    expect(bucketFor(45)).toBe('high')
    expect(bucketFor(44.9)).toBe('medium')
    expect(bucketFor(25)).toBe('medium')
    expect(bucketFor(24.9)).toBe('low')
    expect(bucketFor(0)).toBe('low')
  })
})

describe('scoreConversation', () => {
  it('reaches the full 100 when every term maxes out', () => {
    const maxed = makeConversation({
      slaDueAt: at(-1), // breached
      createdAt: at(-300), // waited past the 240m cap
      customer: { name: 'A', company: 'B', tier: 'enterprise' },
      escalation: {
        reason: 'angry_customer',
        summary: '',
        aiConfidence: 0,
        csat: 1,
        sentiment: 'angry',
      },
    })
    expect(scoreConversation(maxed, NOW)).toBe(100)
    expect(bucketFor(scoreConversation(maxed, NOW))).toBe('critical')
  })

  it('floors near zero for a calm, well-inside-SLA starter', () => {
    const calm = makeConversation({
      slaDueAt: at(200), // >120m out → urgency 0
      createdAt: at(0), // no wait
      customer: { name: 'A', company: 'B', tier: 'starter' },
      escalation: { reason: 'human_requested', summary: '', aiConfidence: 1, csat: 5, sentiment: 'positive' },
    })
    // Only the 0.2 starter tier weight contributes: 10 * 0.2 = 2.
    expect(scoreConversation(calm, NOW)).toBeCloseTo(2)
    expect(bucketFor(scoreConversation(calm, NOW))).toBe('low')
  })

  it('lets a breach dominate an item that is merely trending toward one', () => {
    const base = {
      createdAt: at(0),
      customer: { name: 'A', company: 'B', tier: 'starter' as const },
      escalation: {
        reason: 'human_requested' as const,
        summary: '',
        aiConfidence: 1,
        csat: null,
        sentiment: 'positive' as const,
      },
    }
    const breached = makeConversation({ ...base, slaDueAt: at(-5) })
    const trending = makeConversation({ ...base, slaDueAt: at(60) })
    expect(scoreConversation(breached, NOW)).toBeGreaterThan(scoreConversation(trending, NOW))

    // A stale breach still contributes the full SLA term — it never decays below a fresh one.
    const staleBreach = makeConversation({ ...base, slaDueAt: at(-60 * 24 * 10) })
    expect(scoreConversation(staleBreach, NOW)).toBe(scoreConversation(breached, NOW))
  })

  it('normalizes csat risk and wait time at the edges', () => {
    const withCsat = (csat: number | null) =>
      makeConversation({
        slaDueAt: at(200),
        createdAt: at(0),
        customer: { name: 'A', company: 'B', tier: 'starter' },
        escalation: { reason: 'low_csat', summary: '', aiConfidence: 1, csat, sentiment: 'positive' },
      })
    // csat 3 adds half the 15pt risk term over a satisfied score; csat ≤2 adds the full term.
    const baseline = scoreConversation(withCsat(5), NOW)
    expect(scoreConversation(withCsat(3), NOW) - baseline).toBeCloseTo(7.5)
    expect(scoreConversation(withCsat(2), NOW) - baseline).toBeCloseTo(15)
    expect(scoreConversation(withCsat(null), NOW)).toBeCloseTo(baseline)

    // Wait time clamps at the 240m cap: 480m waited is not worth more than 240m.
    const waitCapped = makeConversation({ slaDueAt: at(200), createdAt: at(-480) })
    const waitAtCap = makeConversation({ slaDueAt: at(200), createdAt: at(-240) })
    expect(scoreConversation(waitCapped, NOW)).toBe(scoreConversation(waitAtCap, NOW))
  })
})
