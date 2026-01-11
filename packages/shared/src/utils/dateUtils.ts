import {
  format,
  isPast,
  isThisMonth,
  isThisQuarter,
  isThisWeek,
  isThisYear,
  isToday,
  subDays,
} from 'date-fns'
import type { PeriodType } from '../api/types'
import { calendarConfig } from '../config/calendar'

export function scheduledDateLabel(scheduledDate: {
  periodType: PeriodType
  anchorDate: Date
}): string {
  const referenceDate = isPast(scheduledDate.anchorDate) ? new Date() : scheduledDate.anchorDate

  switch (scheduledDate.periodType) {
    case 'year': {
      if (isThisYear(referenceDate)) {
        return 'This year'
      }
      return referenceDate.getFullYear().toString()
    }
    case 'quarter': {
      if (isThisQuarter(referenceDate)) {
        return 'This quarter'
      }
      const quarter = Math.floor(referenceDate.getMonth() / 3) + 1
      return `Q${quarter} ${referenceDate.getFullYear()}`
    }
    case 'month':
      if (isThisMonth(referenceDate)) {
        return 'This month'
      }
      return referenceDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    case 'week':
      if (isThisWeek(referenceDate, { weekStartsOn: calendarConfig.weekStartsOn })) {
        return 'This week'
      }
      if (isThisWeek(subDays(referenceDate, 7), { weekStartsOn: calendarConfig.weekStartsOn })) {
        return 'Next week'
      }
      return format(referenceDate, "'W'l yyyy")
    default:
      if (isToday(referenceDate)) {
        return 'Today'
      }
      if (isToday(subDays(referenceDate, 1))) {
        return 'Tomorrow'
      }
      // TODO: if this year, skip year in format
      return format(referenceDate, 'PPP')
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
      return isThisWeek(anchorDate, { weekStartsOn: calendarConfig.weekStartsOn })
    default:
      return isToday(anchorDate)
  }
}

export function sortByPeriodTypeAndDate(
  am: {
    scheduledDate: { periodType: PeriodType; anchorDate: Date } | null
    completed?: boolean
    scheduleOrder?: string | null
  },
  bm: {
    scheduledDate: { periodType: PeriodType; anchorDate: Date } | null
    completed?: boolean
    scheduleOrder?: string | null
  },
): number {
  const periodTypeOrder: PeriodType[] = ['day', 'week', 'month', 'quarter', 'year']
  const a = am.scheduledDate
  const b = bm.scheduledDate

  // Sort completed tasks last
  if (am.completed !== bm.completed) {
    return am.completed ? 1 : -1
  }

  if (!a && !b) return 0
  if (!a) return 1
  if (!b) return -1

  const periodTypeComparison =
    periodTypeOrder.indexOf(a.periodType) - periodTypeOrder.indexOf(b.periodType)
  if (periodTypeComparison !== 0) {
    return periodTypeComparison
  }

  // Within the same period type, sort by scheduleOrder if both have it
  if (am.scheduleOrder && bm.scheduleOrder) {
    return am.scheduleOrder.localeCompare(bm.scheduleOrder)
  }

  // If only one has scheduleOrder, prioritize it
  if (am.scheduleOrder && !bm.scheduleOrder) return -1
  if (!am.scheduleOrder && bm.scheduleOrder) return 1

  // Otherwise, sort by anchor date
  return a.anchorDate.getTime() - b.anchorDate.getTime()
}
