import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { calendarConfig } from '../config/calendar'

interface ScheduleCalendarProps {
  onSelectDate: (date: Date) => void
}

export const ScheduleCalendar = ({ onSelectDate }: ScheduleCalendarProps) => {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)

  // Get the full calendar grid (including padding days from previous/next month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: calendarConfig.weekStartsOn })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: calendarConfig.weekStartsOn })

  // Generate all days to display
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Day headers (Mon, Tue, Wed, etc.)
  const dayHeaders = eachDayOfInterval({
    start: calendarStart,
    end: endOfWeek(calendarStart, { weekStartsOn: calendarConfig.weekStartsOn }),
  }).map((day) => format(day, 'EEE'))

  const isWeekend = (date: Date) => {
    const day = getDay(date)
    return day === 0 || day === 6 // Sunday or Saturday
  }

  return (
    <div className="w-full px-2 py-2">
      {/* Month header */}
      <div className="mb-2 px-1 font-medium text-gray-700 text-xs">
        {format(today, 'MMMM yyyy')}
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {dayHeaders.map((header, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Order cannot change
          <div key={i} className="text-center font-medium text-gray-500 text-xs">
            {header.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, today)
          const isTodayDate = isToday(day)
          const isWeekendDay = isWeekend(day)

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className="aspect-square cursor-pointer rounded text-center text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
            >
              <div
                className={`flex h-full items-center justify-center rounded ${
                  isTodayDate
                    ? 'bg-blue-500 font-semibold text-white hover:bg-blue-600'
                    : isCurrentMonth
                      ? isWeekendDay
                        ? 'text-gray-400'
                        : 'text-gray-700'
                      : 'text-gray-300'
                }`}
              >
                {format(day, 'd')}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
