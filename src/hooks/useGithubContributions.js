import { useEffect, useState } from 'react'

import {
  contributions,
  fetchGithubContributions,
  getRollingYearRange,
} from '../data/contributions.js'

export default function useGithubContributions() {
  const [activity, setActivity] = useState({
    status: 'loading',
  })

  useEffect(() => {
    let active = true

    const { startDate, endDate } =
      getRollingYearRange()

    fetchGithubContributions(
      startDate,
      endDate,
    ).then(
      (records) => {
        if (!active) return

        setActivity({
          status: 'live',
          startDate,
          endDate,
          contributions: records,
        })
      },
      () => {
        if (!active) return

        setActivity({
          status: 'fallback',
          startDate,
          endDate,
          contributions,
        })
      },
    )

    return () => {
      active = false
    }
  }, [])

  return activity
}