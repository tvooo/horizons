import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  differenceInDays,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns'

export interface ScheduleOption {
  label: string
  periodType: 'day' | 'week' | 'month' | 'quarter' | 'year'
  getDaysOffset: () => number
  separator?: boolean
}

export const scheduleOptions: ScheduleOption[] = [
  {
    label: 'Today',
    periodType: 'day',
    getDaysOffset: () => 0,
  },
  {
    label: 'Tomorrow',
    periodType: 'day',
    getDaysOffset: () => 1,
  },
  {
    label: 'This Week',
    periodType: 'week',
    getDaysOffset: () => 0,
    separator: true,
  },
  {
    label: 'Next Week',
    periodType: 'week',
    getDaysOffset: () => {
      const now = new Date()
      const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 })
      return differenceInDays(nextWeekStart, now)
    },
  },
  {
    label: 'This Month',
    periodType: 'month',
    getDaysOffset: () => 0,
    separator: true,
  },
  {
    label: 'Next Month',
    periodType: 'month',
    getDaysOffset: () => {
      const now = new Date()
      const nextMonthStart = startOfMonth(addMonths(now, 1))
      return differenceInDays(nextMonthStart, now)
    },
  },
  {
    label: 'This Quarter',
    periodType: 'quarter',
    getDaysOffset: () => {
      const now = new Date()
      const quarterStart = startOfQuarter(now)
      return differenceInDays(quarterStart, now)
    },
    separator: true,
  },
  {
    label: 'Next Quarter',
    periodType: 'quarter',
    getDaysOffset: () => {
      const now = new Date()
      const nextQuarterStart = startOfQuarter(addQuarters(now, 1))
      return differenceInDays(nextQuarterStart, now)
    },
  },
  {
    label: 'This Year',
    periodType: 'year',
    getDaysOffset: () => {
      const now = new Date()
      const yearStart = startOfYear(now)
      return differenceInDays(yearStart, now)
    },
    separator: true,
  },
  {
    label: 'Next Year',
    periodType: 'year',
    getDaysOffset: () => {
      const now = new Date()
      const nextYearStart = startOfYear(addYears(now, 1))
      return differenceInDays(nextYearStart, now)
    },
  },
]

export const handleSchedule = async (
  updateFn: (
    periodType: 'day' | 'week' | 'month' | 'quarter' | 'year',
    anchorDate: Date,
  ) => Promise<void>,
  periodType: 'day' | 'week' | 'month' | 'quarter' | 'year',
  daysOffset: number,
) => {
  let anchorDate = addDays(new Date(), daysOffset)

  // For week/month/quarter/year scheduling, set to start of period
  if (periodType === 'week') {
    anchorDate = startOfWeek(anchorDate, { weekStartsOn: 1 })
  } else if (periodType === 'month') {
    anchorDate = startOfMonth(anchorDate)
  } else if (periodType === 'quarter') {
    anchorDate = startOfQuarter(anchorDate)
  } else if (periodType === 'year') {
    anchorDate = startOfYear(anchorDate)
  }

  await updateFn(periodType, anchorDate)
}
