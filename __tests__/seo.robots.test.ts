/**
 * Tests for app/robots.ts
 *
 * Covers:
 *  - robots() returns a valid Robots object
 *  - User-agent wildcard is set
 *  - Root path '/' is allowed
 *  - Sensitive paths are disallowed (/api/, /archived/, admin patterns)
 *  - Sitemap URL points to /sitemap.xml
 */

// robots.ts has no external dependencies — import directly
import robots from '../app/robots'

describe('robots()', () => {
  let result: ReturnType<typeof robots>

  beforeAll(() => {
    result = robots()
  })

  test('returns a rules array with at least one rule', () => {
    expect(Array.isArray(result.rules)).toBe(true)
    expect((result.rules as any[]).length).toBeGreaterThanOrEqual(1)
  })

  test('first rule applies to all user-agents (*)', () => {
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect((rule as any).userAgent).toBe('*')
  })

  test('allows the root path "/"', () => {
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    const allow = (rule as any).allow
    const allowList: string[] = Array.isArray(allow) ? allow : [allow]
    expect(allowList).toContain('/')
  })

  test('disallows /api/ path', () => {
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    const disallow = (rule as any).disallow
    const disallowList: string[] = Array.isArray(disallow) ? disallow : [disallow]
    expect(disallowList.some(d => d.includes('/api/'))).toBe(true)
  })

  test('disallows /archived/ path', () => {
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    const disallow = (rule as any).disallow
    const disallowList: string[] = Array.isArray(disallow) ? disallow : [disallow]
    expect(disallowList.some(d => d.includes('/archived'))).toBe(true)
  })

  test('disallows admin paths', () => {
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
    const disallow = (rule as any).disallow
    const disallowList: string[] = Array.isArray(disallow) ? disallow : [disallow]
    expect(disallowList.some(d => d.includes('admin'))).toBe(true)
  })

  test('sitemap URL includes /sitemap.xml', () => {
    expect(result.sitemap).toBeDefined()
    const sitemapUrls = Array.isArray(result.sitemap) ? result.sitemap : [result.sitemap]
    expect(sitemapUrls.some((u: any) => typeof u === 'string' && u.includes('/sitemap.xml'))).toBe(true)
  })

  test('sitemap URL is absolute (starts with https://)', () => {
    const sitemapUrls = Array.isArray(result.sitemap) ? result.sitemap : [result.sitemap]
    expect(sitemapUrls.every((u: any) => typeof u === 'string' && u.startsWith('https://'))).toBe(true)
  })
})
