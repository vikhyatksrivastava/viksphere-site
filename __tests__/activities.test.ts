import { activities } from '../data/activities'

describe('activities data', () => {
  test('all blog activities have an external url', () => {
    const blogs = activities.filter((a) => a.kind === 'blog')
    expect(blogs.length).toBeGreaterThan(0)
    for (const b of blogs) {
      expect(b.url).toBeDefined()
      expect(typeof b.url).toBe('string')
      expect(b.url).toMatch(/^https?:\/\//)
    }
  })

  test('dates are parseable as valid dates', () => {
    for (const a of activities) {
      expect(() => new Date(a.date)).not.toThrow()
      const d = new Date(a.date)
      expect(Number.isNaN(d.getTime())).toBe(false)
    }
  })
})
