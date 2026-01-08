import {
  addDays,
  addMonths,
  addQuarters,
  addYears,
  differenceInDays,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import { calendarConfig } from '../config/calendar'

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
    getDaysOffset: () => 7,
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
      const today = startOfDay(new Date())
      const nextMonthStart = startOfMonth(addMonths(today, 1))
      return differenceInDays(nextMonthStart, today)
    },
  },
  {
    label: 'This Quarter',
    periodType: 'quarter',
    getDaysOffset: () => {
      const today = startOfDay(new Date())
      const quarterStart = startOfQuarter(today)
      return differenceInDays(quarterStart, today)
    },
    separator: true,
  },
  {
    label: 'Next Quarter',
    periodType: 'quarter',
    getDaysOffset: () => {
      const today = startOfDay(new Date())
      const nextQuarterStart = startOfQuarter(addQuarters(today, 1))
      return differenceInDays(nextQuarterStart, today)
    },
  },
  {
    label: 'This Year',
    periodType: 'year',
    getDaysOffset: () => {
      const today = startOfDay(new Date())
      const yearStart = startOfYear(today)
      return differenceInDays(yearStart, today)
    },
    separator: true,
  },
  {
    label: 'Next Year',
    periodType: 'year',
    getDaysOffset: () => {
      const today = startOfDay(new Date())
      const nextYearStart = startOfYear(addYears(today, 1))
      return differenceInDays(nextYearStart, today)
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
    anchorDate = startOfWeek(anchorDate, { weekStartsOn: calendarConfig.weekStartsOn })
  } else if (periodType === 'month') {
    anchorDate = startOfMonth(anchorDate)
  } else if (periodType === 'quarter') {
    anchorDate = startOfQuarter(anchorDate)
  } else if (periodType === 'year') {
    anchorDate = startOfYear(anchorDate)
  }

  await updateFn(periodType, anchorDate)
}
