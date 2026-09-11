import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildContributionCalendar, contributions, fetchGithubContributions, getRollingYearRange, normalizeGithubContributions } from './contributions.js'

const { startDate, endDate } = getRollingYearRange(new Date(2026, 8, 11))
assert.deepEqual({ startDate, endDate }, { startDate: '2025-09-12', endDate: '2026-09-11' })
const calendar = buildContributionCalendar(startDate, endDate, [])
assert.equal(calendar.cells.filter(Boolean).length, 365)
assert.equal(calendar.cells.findIndex(Boolean), 5, 'September 12, 2025 belongs on Friday')
assert.equal(calendar.cells.filter(Boolean).at(-1).date, endDate)
assert.equal(calendar.months.filter(month => month.label).length, 12)
assert.equal(calendar.cells.length, calendar.weeks * 7)
const sampleRange = getRollingYearRange()
assert.equal(buildContributionCalendar(sampleRange.startDate, sampleRange.endDate, contributions).total, 646)
assert.equal(buildContributionCalendar('2024-01-01', '2024-12-31', [{ date: '2024-02-29', count: 9 }]).cells.filter(Boolean).length, 366)
assert.equal(buildContributionCalendar('2000-01-01', '2000-12-31', []).weeks, 54)
assert.equal(buildContributionCalendar('2026-01-01', '2026-12-31', [{ date: '2026-01-01', count: 9 }], [0, 1, 2, 5, 8]).cells[4].level, 4)
assert.throws(() => buildContributionCalendar('2026-01-01', '2026-12-31', [], [0, 1, 1, 4, 8]))
assert.throws(() => buildContributionCalendar('2026-02-30', '2026-03-10', []))
assert.throws(() => buildContributionCalendar('2026-03-10', '2026-03-01', []))
// Full DST-spanning weeks remain aligned regardless of the machine's time zone.
assert.equal(buildContributionCalendar('2026-03-07', '2026-03-09', []).cells.filter(Boolean).length, 3)

test('rolling public data validates, combines years, calculates totals, caches and retries', async (t) => {
  const records = [{ date: '2025-09-12', count: 12 }, { date: '2026-01-02', count: 0 }, { date: '2026-09-11', count: 4 }]
  assert.deepEqual(normalizeGithubContributions({ contributions: records.map(record => ({ ...record, level: 0 })) }), records)
  assert.equal(buildContributionCalendar(startDate, endDate, records).total, 16)
  for (const data of [null, {}, { contributions: [] }, { contributions: [null] },
    { contributions: [{ date: '2026-02-30', count: 1 }] },
    { contributions: [{ date: '2026-01-01', count: -1 }] },
    { contributions: [{ date: '2026-01-01', count: 1.5 }] },
    { contributions: [{ date: '2026-01-01', count: '1' }] },
    { contributions: [records[0], records[0]] },
  ]) assert.throws(() => normalizeGithubContributions(data))

  let now = 0
  t.mock.method(Date, 'now', () => now)
  const request = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.ok(url.startsWith('https://github-contributions-api.jogruber.de/v4/bhpranit08?y='))
    assert.ok(options.signal instanceof AbortSignal)
    const year = new URL(url).searchParams.get('y')
    return { ok: true, json: async () => ({ total: { [year]: 9999 }, contributions: records.filter(record => record.date.startsWith(year)) }) }
  })
  const first = fetchGithubContributions(startDate, endDate)
  const second = fetchGithubContributions(startDate, endDate)
  assert.deepEqual(await first, records)
  assert.deepEqual(await second, records)
  assert.equal(request.mock.callCount(), 2, 'One shared request per calendar year')
  await fetchGithubContributions(startDate, endDate)
  assert.equal(request.mock.callCount(), 2)
  now += 3600001
  await fetchGithubContributions(startDate, endDate)
  assert.equal(request.mock.callCount(), 4, 'Refresh expired years')
  for (const response of [
    async () => ({ ok: false, status: 503 }),
    async () => { throw new TypeError('Network unavailable') },
    async () => { throw new DOMException('Timed out', 'TimeoutError') },
    async () => ({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON') } }),
    async () => ({ ok: true, json: async () => ({ contributions: [] }) }),
    async () => ({ ok: true, json: async () => ({ contributions: [{ date: '2024-01-01', count: -1 }] }) }),
  ]) {
    request.mock.mockImplementation(response)
    await assert.rejects(fetchGithubContributions('2024-01-01', '2024-12-31'))
  }
  assert.equal(request.mock.callCount(), 10, 'Failures must not poison the cache')
})
