import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildContributionCalendar, contributions, contributionYear, fetchGithubContributions, normalizeGithubContributions } from './contributions.js'

const calendar = buildContributionCalendar(contributionYear, contributions)
assert.equal(calendar.months.length, 12)
assert.equal(calendar.cells.filter(Boolean).length, 365)
assert.equal(calendar.cells.length, calendar.weeks * 7)
assert.equal(calendar.cells[4].date, '2026-01-01', 'January 1 belongs on Thursday')
assert.equal(calendar.total, contributions.reduce((sum, entry) => sum + entry.count, 0))
assert.equal(calendar.total, 646, 'The placeholder total comes from the daily records')
assert.equal(buildContributionCalendar(2026, [{ date: '2026-01-01', count: 9 }], [0, 1, 2, 5, 8]).cells[4].level, 4)
assert.throws(() => buildContributionCalendar(2026, [], [0, 1, 1, 4, 8]))
assert.deepEqual([...new Set(calendar.cells.filter(Boolean).map((cell) => cell.level))].sort(), [0, 1, 2, 3, 4])
const leap = buildContributionCalendar(2024, [{ date: '2024-02-29', count: 9 }])
assert.equal(leap.cells.filter(Boolean).length, 366)
assert.equal(leap.total, 9)
assert.equal(leap.cells.find((cell) => cell?.date === '2024-02-29').level, 3)
assert.equal(buildContributionCalendar(2000, []).weeks, 54, 'Leap years starting Saturday need 54 columns')
assert.throws(() => buildContributionCalendar(2026, [{ date: '2026-02-30', count: 1 }]))
assert.throws(() => buildContributionCalendar(2026, [{ date: '2026-01-01', count: -1 }]))
assert.throws(() => buildContributionCalendar(2026, [{ date: '2026-01-01', count: 1 }, { date: '2026-01-01', count: 2 }]))

test('public data is normalized, validated, cached and retryable after failure', async (t) => {
  const records = [{ date: '2026-01-01', count: 12 }, { date: '2026-01-02', count: 0 }]
  const payload = { total: { 2026: 9999 }, contributions: records.map((record) => ({ ...record, level: 0 })) }
  assert.deepEqual(normalizeGithubContributions(payload, 2026), records)
  assert.equal(buildContributionCalendar(2026, normalizeGithubContributions(payload, 2026)).total, 12, 'Ignore upstream totals and intensity levels')
  for (const data of [null, {}, { contributions: [] }, { contributions: [null] },
    { contributions: [{ date: '2026-02-30', count: 1 }] },
    { contributions: [{ date: '2026-01-01', count: -1 }] },
    { contributions: [{ date: '2026-01-01', count: 1.5 }] },
    { contributions: [{ date: '2026-01-01', count: '1' }] },
    { contributions: [{ date: '2025-01-01', count: 1 }] },
    { contributions: [records[0], records[0]] },
  ]) assert.throws(() => normalizeGithubContributions(data, 2026))

  let now = 0
  t.mock.method(Date, 'now', () => now)
  const request = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://github-contributions-api.jogruber.de/v4/bhpranit08?y=2026')
    assert.ok(options.signal instanceof AbortSignal)
    return { ok: true, json: async () => payload }
  })
  const first = fetchGithubContributions(2026)
  assert.equal(fetchGithubContributions(2026), first, 'Share the in-flight request')
  assert.deepEqual(await first, records)
  assert.deepEqual(await fetchGithubContributions(2026), records)
  assert.equal(request.mock.callCount(), 1)
  now += 3600001
  await fetchGithubContributions(2026)
  assert.equal(request.mock.callCount(), 2, 'Refresh expired data')

  for (const response of [
    async () => ({ ok: false, status: 503 }),
    async () => { throw new TypeError('Network unavailable') },
    async () => { throw new DOMException('Timed out', 'TimeoutError') },
    async () => ({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON') } }),
    async () => ({ ok: true, json: async () => ({ contributions: [] }) }),
  ]) {
    request.mock.mockImplementation(response)
    await assert.rejects(fetchGithubContributions(2025))
  }
  assert.equal(request.mock.callCount(), 7, 'Failures must not poison the cache')
})
