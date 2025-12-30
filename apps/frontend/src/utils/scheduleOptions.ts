export interface ScheduleOption {
  label: string
  periodType: 'day' | 'week' | 'month'
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
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return Math.ceil((nextMonth.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    },
  },
]

export const handleSchedule = async (
  updateFn: (periodType: 'day' | 'week' | 'month', anchorDate: Date) => Promise<void>,
  periodType: 'day' | 'week' | 'month',
  daysOffset: number,
) => {
  const anchorDate = new Date()
  anchorDate.setDate(anchorDate.getDate() + daysOffset)

  // For week/month scheduling, set to start of period
  if (periodType === 'week') {
    const dayOfWeek = anchorDate.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday is start of week
    anchorDate.setDate(anchorDate.getDate() + diff)
  } else if (periodType === 'month') {
    anchorDate.setDate(1)
  }

  await updateFn(periodType, anchorDate)
}
