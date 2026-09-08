export const contributionYear = 2026

// Deterministic sample data, never presented as live GitHub activity.
export const contributions = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(Date.UTC(contributionYear, 0, index + 1))
  const sample = ((index + 11) * 16807) % 101
  return { date: date.toISOString().slice(0, 10), count: sample < 46 ? 0 : sample < 80 ? 1 : sample % 13 + 1 }
})

export const contributionLevels = [0, 1, 4, 7, 10]

export function buildContributionCalendar(year, entries, levels = contributionLevels) {
  if (levels.length !== 5 || levels[0] !== 0 || levels.some((value, index) => !Number.isInteger(value) || (index > 0 && value <= levels[index - 1]))) {
    throw new Error('Contribution levels require five increasing integer thresholds starting at zero')
  }
  const counts = new Map()
  for (const { date, count } of entries) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || !Number.isInteger(count) || count < 0) {
      throw new Error('Contributions require a valid YYYY-MM-DD date and a non-negative integer count')
    }
    if (counts.has(date)) throw new Error(`Duplicate contribution date: ${date}`)
    counts.set(date, count)
  }
  const start = Date.UTC(year, 0, 1)
  const offset = new Date(start).getUTCDay()
  const days = (Date.UTC(year + 1, 0, 1) - start) / 86400000
  const weeks = Math.ceil((offset + days) / 7)
  const cells = Array.from({ length: weeks * 7 }, (_, index) => {
    const day = index - offset
    if (day < 0 || day >= days) return null
    const date = new Date(start + day * 86400000).toISOString().slice(0, 10)
    const count = counts.get(date) ?? 0
    return { date, count, level: levels.findLastIndex((threshold) => count >= threshold) }
  })
  const months = Array.from({ length: 12 }, (_, month) => {
    const date = new Date(Date.UTC(year, month, 1))
    return { label: date.toLocaleString('en', { month: 'short', timeZone: 'UTC' }), column: Math.floor((offset + (date.getTime() - start) / 86400000) / 7) }
  })
  return { cells, months, weeks, total: cells.reduce((sum, cell) => sum + (cell?.count ?? 0), 0) }
}
