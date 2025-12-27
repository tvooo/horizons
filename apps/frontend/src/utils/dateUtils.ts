import {
  format,
  isThisMonth,
  isThisQuarter,
  isThisWeek,
  isThisYear,
  isToday,
  subDays,
} from 'date-fns'
import type { PeriodType } from '../types'

export function scheduledDateLabel(scheduledDate: {
  periodType: PeriodType
  anchorDate: Date
}): string {
  const { anchorDate, periodType } = scheduledDate

  switch (periodType) {
    case 'year':
      return 'Some year'
    case 'quarter':
      return 'Some quarter'
    case 'month':
      if (isThisMonth(anchorDate)) {
        return 'This month'
      }
      return anchorDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    case 'week':
      if (isThisWeek(anchorDate, { weekStartsOn: 1 })) {
        return 'This week'
      }
      if (isThisWeek(subDays(anchorDate, 7), { weekStartsOn: 1 })) {
        return 'Next week'
      }
      return format(anchorDate, "'W'l yyyy")
    default:
      if (isToday(anchorDate)) {
        return 'Today'
      }
      if (isToday(subDays(anchorDate, 1))) {
        return 'Tomorrow'
      }
      // TODO: if this year, skip year in format
      return format(anchorDate, 'PPP')
  }
}

export function isCurrentPeriod(scheduledDate: {
  periodType: PeriodType
  anchorDate: Date
}): boolean {
  const { anchorDate, periodType } = scheduledDate

  switch (periodType) {
    case 'year':
      return isThisYear(anchorDate)
    case 'quarter':
      return isThisQuarter(anchorDate)
    case 'month':
      return isThisMonth(anchorDate)
    case 'week':
      return isThisWeek(anchorDate, { weekStartsOn: 1 })
    default:
      return isToday(anchorDate)
  }
}
