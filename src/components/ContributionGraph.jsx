import {
  useId,
  useMemo,
  useRef,
} from 'react'

import {
  buildContributionCalendar,
  contributionLevels,
  getRollingYearRange,
} from '../data/contributions.js'

import useContributionAnimations from '../animations/useContributionAnimations.js'

const days = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
]

export default function ContributionGraph({
  contributions,
  levels = contributionLevels,
  status = 'fallback',
}) {
  /*
   * The graph always represents the latest 365 days.
   */
  const { startDate, endDate } = useMemo(
    () => getRollingYearRange(),
    [],
  )

  const {
    cells,
    months,
    weeks,
    total,
  } = useMemo(
    () =>
      buildContributionCalendar(
        startDate,
        endDate,
        contributions,
        levels,
      ),
    [
      startDate,
      endDate,
      contributions,
      levels,
    ],
  )

  const root = useRef(null)
  const tooltip = useRef(null)
  const tooltipId = useId()

  /*
   * First/last actual contribution cells.
   * Padding cells are null.
   */
  const first = cells.findIndex(Boolean)
  const last = cells.findLastIndex(Boolean)

  const sample = status !== 'live'

  useContributionAnimations(root, total)

  /*
   * ----------------------------------------------------------
   * Tooltip
   * ----------------------------------------------------------
   */

  const hideTooltip = () => {
    if (tooltip.current) {
      tooltip.current.hidden = true
    }
  }

  const showTooltip = (event) => {
    const cell = event.target.closest(
      '[data-contribution-cell]',
    )

    if (
      !cell ||
      !root.current ||
      !tooltip.current
    ) {
      return
    }

    const box =
      cell.getBoundingClientRect()

    const frame =
      root.current.getBoundingClientRect()

    const readout = tooltip.current

    readout.textContent =
      `${cell.dataset.date.replaceAll('-', '.')} / ${cell.dataset.count} CONTRIBUTIONS`

    readout.hidden = false

    readout.style.left = `${Math.max(
      0,
      Math.min(
        frame.width -
          readout.offsetWidth,
        box.left - frame.left,
      ),
    )}px`

    readout.style.top =
      `${box.top -
        frame.top -
        readout.offsetHeight -
        8}px`

    /*
     * Preserve roving keyboard focus.
     */
    if (event.type === 'focus') {
      root.current
        .querySelector(
          '[data-contribution-cell][tabindex="0"]',
        )
        ?.setAttribute(
          'tabindex',
          '-1',
        )

      cell.tabIndex = 0
    }
  }

  /*
   * ----------------------------------------------------------
   * Keyboard navigation
   * ----------------------------------------------------------
   */

  const navigate = (event) => {
    if (event.key === 'Escape') {
      hideTooltip()
      return
    }

    const cell = event.target.closest(
      '[data-contribution-cell]',
    )

    if (!cell) return

    const index = Number(
      cell.dataset.index,
    )

    const offset = {
      ArrowLeft: -7,
      ArrowRight: 7,
      ArrowUp: -1,
      ArrowDown: 1,
    }[event.key]

    const next =
      event.key === 'Home'
        ? first
        : event.key === 'End'
          ? last
          : offset === undefined
            ? null
            : Math.max(
                first,
                Math.min(
                  last,
                  index + offset,
                ),
              )

    if (next === null) {
      return
    }

    event.preventDefault()

    const target =
      root.current?.querySelector(
        `[data-index="${next}"]`,
      )

    target?.focus({
      preventScroll: true,
    })

    target?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
    })
  }

  const rangeLabel =
    `${startDate.replaceAll('-', '.')} → ${endDate.replaceAll('-', '.')}`

  return (
    <figure
      ref={root}
      className="contribution-panel"
      onPointerOver={showTooltip}
      onPointerLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={navigate}
    >
      <span
        className="graph-rule"
        aria-hidden="true"
      />

      <figcaption className="graph-heading">
        <span>
          CONTRIBUTION LOG / LAST 365 DAYS
        </span>

        <span className="sample-badge">
          {sample
            ? 'LOCAL SAMPLE / FALLBACK'
            : 'LIVE CONTRIBUTION DATA'}
        </span>
      </figcaption>

      <p className="graph-range">
        {rangeLabel}
      </p>

      <div
        className="graph-scroll"
        tabIndex={0}
        role="region"
        onScroll={hideTooltip}
        aria-label={`Daily contributions from ${startDate} through ${endDate}. Scroll horizontally and focus a day to inspect activity.`}
      >
        <table
          className="contribution-grid"
          aria-label={`${total.toLocaleString(
            'en-US',
          )} ${
            sample
              ? 'sample'
              : 'GitHub'
          } contributions during the last 365 days`}
        >
          <thead>
            <tr>
              <td />

              {months.map(
                (month, index) => (
                  <th
                    className="graph-month"
                    key={`${month.year}-${month.month}-${month.column}`}
                    scope="colgroup"
                    colSpan={
                      (
                        months[
                          index + 1
                        ]?.column ??
                        weeks
                      ) -
                      month.column
                    }
                  >
                    {month.label}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {days.map(
              (day, row) => (
                <tr key={day}>
                  <th
                    className="graph-day"
                    scope="row"
                  >
                    {day}
                  </th>

                  {Array.from(
                    {
                      length: weeks,
                    },
                    (_, week) => {
                      const index =
                        week * 7 +
                        row

                      const cell =
                        cells[index]

                      return (
                        <td key={week}>
                          {cell ? (
                            <button
                              type="button"
                              className={`contribution-cell level-${cell.level}`}
                              data-contribution-cell
                              data-index={index}
                              data-date={cell.date}
                              data-count={cell.count}
                              tabIndex={
                                index === first
                                  ? 0
                                  : -1
                              }
                              aria-label={`${cell.date}: ${cell.count} contributions`}
                              aria-describedby={
                                tooltipId
                              }
                            />
                          ) : (
                            <span
                              className="contribution-cell empty-cell"
                              aria-hidden="true"
                            />
                          )}
                        </td>
                      )
                    },
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <span
        className="graph-rule"
        aria-hidden="true"
      />

      <div className="graph-footer">
        <p className="contribution-summary">
          <span className="sr-only">
            {total.toLocaleString(
              'en-US',
            )}
          </span>

          <strong
            data-contribution-count
            aria-hidden="true"
          >
            {total.toLocaleString(
              'en-US',
            )}
          </strong>{' '}

          {sample
            ? 'SAMPLE CONTRIBUTIONS'
            : 'CONTRIBUTIONS'}{' '}
          IN THE LAST 365 DAYS
        </p>

        <div
          className="graph-legend"
          aria-label="Activity intensity from less to more"
        >
          <span>
            LESS
          </span>

          {levels.map(
            (threshold, index) => (
              <span
                key={threshold}
                className={`contribution-cell level-${index}`}
                aria-hidden="true"
              />
            ),
          )}

          <span>
            MORE
          </span>
        </div>
      </div>

      <p className="graph-hint">
        {rangeLabel} /{' '}
        {sample
          ? 'SAMPLE RECORD'
          : 'PUBLIC ACTIVITY'}{' '}
        · FOCUS A DAY TO INSPECT

        <span>
          SCROLL TO EXPLORE →
        </span>
      </p>

      <div
        ref={tooltip}
        id={tooltipId}
        role="tooltip"
        className="graph-tooltip"
        hidden
      />
    </figure>
  )
}