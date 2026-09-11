const DAY_MS = 86400000
const CACHE_MS = 60 * 60 * 1000

export const githubUsername = 'bhpranit08'

/*
 * Kept for compatibility with any existing code that imports it.
 * The live graph no longer uses a calendar year as its date range.
 */
export const contributionYear = new Date().getFullYear()

/*
 * ------------------------------------------------------------
 * Date utilities
 * ------------------------------------------------------------
 */

function formatDate(date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDate(dateString) {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) throw new Error('Invalid contribution date')
  const date = new Date(`${dateString}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || formatDate(date) !== dateString) throw new Error('Invalid contribution date')
  return date
}

/*
 * Returns the exact rolling 365-day range:
 *
 * today - 364 days
 * through
 * today
 *
 * Example:
 * 2026-09-11 → 2025-09-12 through 2026-09-11
 */
export function getRollingYearRange(today = new Date()) {

  const end = new Date(Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ))

  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 364)

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

/*
 * ------------------------------------------------------------
 * Placeholder fallback data
 * ------------------------------------------------------------
 *
 * This is only used when live public GitHub data cannot be
 * loaded. It always represents a rolling 365-day period too.
 */

const sampleRange = getRollingYearRange()

const sampleStartDate = parseDate(sampleRange.startDate)

export const contributions = Array.from({ length: 365 }, (_, index) => {
  const date = new Date(sampleStartDate)
  date.setUTCDate(date.getUTCDate() + index)

  const sample = ((index + 11) * 16807) % 101

  return {
    date: formatDate(date),
    count:
      sample < 46
        ? 0
        : sample < 80
          ? 1
          : (sample % 13) + 1,
  }
})

/*
 * Five increasing contribution thresholds.
 *
 * Index 0 → level-0
 * Index 1 → level-1
 * Index 2 → level-2
 * Index 3 → level-3
 * Index 4 → level-4
 */
export const contributionLevels = [0, 1, 4, 7, 10]

/*
 * ------------------------------------------------------------
 * Request cache
 * ------------------------------------------------------------
 *
 * The public GitHub contribution service accepts one calendar
 * year at a time, so we cache by year.
 */

const requests = new Map()

/*
 * ------------------------------------------------------------
 * Normalize public GitHub data
 * ------------------------------------------------------------
 *
 * Public source:
 * https://github.com/grubersjoe/github-contributions-api
 */

function contributionCounts(entries) {
  const counts = new Map()

  /*
   * Validate every contribution record.
   */
  for (const { date, count } of entries) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
      new Date(`${date}T00:00:00Z`)
        .toISOString()
        .slice(0, 10) !== date ||
      !Number.isInteger(count) ||
      count < 0
    ) {
      throw new Error(
        'Contributions require a valid YYYY-MM-DD date and a non-negative integer count',
      )
    }

    if (counts.has(date)) {
      throw new Error(
        `Duplicate contribution date: ${date}`,
      )
    }

    counts.set(date, count)
  }

  return counts
}

export function normalizeGithubContributions(data) {
  if (
    !Array.isArray(data?.contributions) ||
    data.contributions.length === 0
  ) {
    throw new Error('Public contribution data is unavailable')
  }

  const entries = data.contributions.map(({ date, count }) => ({ date, count }))
  contributionCounts(entries)
  return entries
}

/*
 * ------------------------------------------------------------
 * Fetch one calendar year
 * ------------------------------------------------------------
 */

function fetchGithubYear(year) {
  const cached = requests.get(year)

  if (cached && cached.expires > Date.now()) {
    return cached.promise
  }

  const url = `https://github-contributions-api.jogruber.de/v4/${githubUsername}?y=${year}`

  const promise = fetch(url, {
    signal: AbortSignal.timeout(10000),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Public contribution request failed (${response.status})`,
        )
      }

      return response.json()
    })
    .then((data) => normalizeGithubContributions(data))
    .catch((error) => {
      requests.delete(year)
      throw error
    })

  requests.set(year, {
    promise,
    expires: Date.now() + CACHE_MS,
  })

  return promise
}

/*
 * ------------------------------------------------------------
 * Fetch the rolling 365-day period
 * ------------------------------------------------------------
 *
 * Because the public contribution endpoint is year-based,
 * we fetch every calendar year touched by the rolling range
 * and then filter the combined result to the exact dates.
 */

export async function fetchGithubContributions(startDate, endDate) {
  if (parseDate(startDate) > parseDate(endDate)) throw new Error('Contribution date range is reversed')
  const startYear = Number(startDate.slice(0, 4))
  const endYear = Number(endDate.slice(0, 4))

  const years = []

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year)
  }

  const results = await Promise.all(years.map(fetchGithubYear))

  const merged = results.flat()

  const start = parseDate(startDate)
  const end = parseDate(endDate)
  if (end < start) throw new Error('Contribution date range is reversed')

  /*
   * Keep only records inside the exact rolling window.
   */
  const filtered = merged.filter(({ date }) => {
    const current = parseDate(date)

    return current >= start && current <= end
  })

  /*
   * Validate and deduplicate.
   */
  const byDate = new Map()

  for (const record of filtered) {
    if (byDate.has(record.date)) {
      throw new Error(
        `Duplicate contribution date: ${record.date}`,
      )
    }

    byDate.set(record.date, record)
  }

  const records = Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  )

  if (records.length === 0) {
    throw new Error(
      'No contribution records found for the rolling 365-day period',
    )
  }

  return records
}

/*
 * ------------------------------------------------------------
 * Build rolling contribution calendar
 * ------------------------------------------------------------
 *
 * Creates a Sunday → Saturday grid around the exact requested
 * 365-day range.
 *
 * The visual grid may contain 52 or 53 columns depending on
 * which weekday the rolling range begins/ends on.
 *
 * Only the actual requested dates contain data.
 * Padding cells are null.
 */

export function buildContributionCalendar(
  startDate,
  endDate,
  entries,
  levels = contributionLevels,
) {
  if (
    levels.length !== 5 ||
    levels[0] !== 0 ||
    levels.some(
      (value, index) =>
        !Number.isInteger(value) ||
        (index > 0 && value <= levels[index - 1]),
    )
  ) {
    throw new Error(
      'Contribution levels require five increasing integer thresholds starting at zero',
    )
  }

  const counts = contributionCounts(entries)

  const start = parseDate(startDate)
  const end = parseDate(endDate)
  if (end < start) throw new Error('Contribution date range is reversed')

  /*
   * Expand backward to the Sunday containing the first date.
   */
  const gridStart = new Date(start)
  gridStart.setUTCDate(
    gridStart.getUTCDate() - gridStart.getUTCDay(),
  )

  /*
   * Expand forward to the Saturday containing the last date.
   */
  const gridEnd = new Date(end)
  gridEnd.setUTCDate(
    gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()),
  )

  const totalGridDays =
    Math.floor((gridEnd - gridStart) / DAY_MS) + 1

  const weeks = Math.ceil(totalGridDays / 7)

  /*
   * Build 7 rows × N weeks.
   *
   * cells[index]:
   *
   * index = week * 7 + weekday
   */
  const cells = Array.from(
    { length: weeks * 7 },
    (_, index) => {
      const date = new Date(gridStart)

      date.setUTCDate(
        date.getUTCDate() + index,
      )

      /*
       * Padding before/after the actual 365-day range.
       */
      if (date < start || date > end) {
        return null
      }

      const dateString = formatDate(date)
      const count = counts.get(dateString) ?? 0

      return {
        date: dateString,
        count,
        level: levels.findLastIndex(
          (threshold) => count >= threshold,
        ),
      }
    },
  )

  /*
   * ----------------------------------------------------------
   * Dynamic month labels
   * ----------------------------------------------------------
   *
   * A month label begins at the first week column that contains
   * a date belonging to that month.
   */

  const months = []

  for (let week = 0; week < weeks; week += 1) {
    const weekStart = new Date(gridStart)

    weekStart.setUTCDate(
      weekStart.getUTCDate() + week * 7,
    )

    const weekEnd = new Date(weekStart)

    weekEnd.setUTCDate(
      weekEnd.getUTCDate() + 6,
    )

    /*
     * Ignore completely padded columns.
     */
    if (weekEnd < start || weekStart > end) {
      continue
    }

    /*
     * Determine the first real date represented in this week.
     */
    const visibleDate =
      weekStart < start ? start : weekStart

    const month = visibleDate.getUTCMonth()
    const year = visibleDate.getUTCFullYear()

    const previous = months.at(-1)

    if (
      !previous ||
      previous.month !== month ||
      previous.year !== year
    ) {
      months.push({
        label: new Intl.DateTimeFormat(
          'en-US',
          {
            month: 'short',
            timeZone: 'UTC',
          },
        ).format(visibleDate),
        month,
        year,
        column: week,
      })
    }
  }

  /*
   * Total only includes the actual rolling 365 days.
   * Null padding cells contribute zero.
   */
  // A rolling year can touch 13 months; omit the partial first month's label.
  if (months.length > 12) months[0].label = ''

  const total = cells.reduce(
    (sum, cell) => sum + (cell?.count ?? 0),
    0,
  )

  return {
    cells,
    months,
    weeks,
    total,
  }
}
