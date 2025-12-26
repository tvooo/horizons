import {
  addDays,
  format,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
} from 'date-fns'
import { Folder, List as ListIcon } from 'lucide-react'
import { useState } from 'react'
import { ProjectIcon } from '../components/ProjectIcon'
// import { lists, tasks } from '../mockData'
import type { ListModel } from '../models/ListModel'
import { useRootStore } from '../models/RootStore'
import type { TaskModel } from '../models/TaskModel'
import type { PeriodType } from '../types'

// Use actual current date
const TODAY = new Date()

// Get next 5 days starting from today
const NEXT_5_DAYS = Array.from({ length: 5 }, (_, i) => {
  const date = addDays(TODAY, i)
  return {
    name: format(date, 'EEEE'),
    date,
    dateString: format(date, 'yyyy-MM-dd'),
    displayDate: format(date, 'MMM d'),
  }
})

const PERIOD_TO_TYPE: Record<string, { periodType: PeriodType; anchorDate: Date }> = {
  'This Week': { periodType: 'week', anchorDate: startOfWeek(TODAY, { weekStartsOn: 1 }) },
  'This Month': { periodType: 'month', anchorDate: startOfMonth(TODAY) },
  'This Quarter': { periodType: 'quarter', anchorDate: startOfQuarter(TODAY) },
}

const TIME_PERIODS = ['This Week', 'This Month', 'This Quarter']

export function Upcoming() {
  const { tasks, lists } = useRootStore()
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    tasks.forEach((task) => {
      initial[task.id] = task.completed
    })
    return initial
  })

  const isWeekend = (dayName: string) => dayName === 'Saturday' || dayName === 'Sunday'
  const isToday = (date: Date) => isSameDay(date, TODAY)

  const toggleTask = (taskId: string) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  // Rollover logic: if scheduled for the past, show it today
  const getTasksForDay = (targetDate: Date): TaskModel[] => {
    const targetDayStart = startOfDay(targetDate)
    const todayStart = startOfDay(TODAY)
    const isTargetToday = isSameDay(targetDate, TODAY)

    return tasks.filter((task) => {
      if (!task.scheduledDate) return false
      if (task.scheduledDate.periodType !== 'day') return false

      const taskDate = startOfDay(task.scheduledDate.anchorDate)

      // If target is today, show today's tasks AND past tasks (rollover)
      if (isTargetToday) {
        return (
          isSameDay(taskDate, todayStart) || (isBefore(taskDate, todayStart) && !task.completed)
        )
      }

      // For future days, only show tasks scheduled for that specific day
      return isSameDay(taskDate, targetDayStart)
    })
  }

  const getTasksForPeriod = (period: string): TaskModel[] => {
    const periodConfig = PERIOD_TO_TYPE[period]
    if (!periodConfig) return []

    return tasks.filter((task) => {
      if (!task.scheduledDate) return false
      if (task.scheduledDate.periodType !== periodConfig.periodType) return false

      const taskPeriodStart = task.scheduledDate.anchorDate

      // Rollover: if scheduled for past period, show in current period
      if (isBefore(taskPeriodStart, periodConfig.anchorDate)) {
        return true
      }

      // Otherwise, check if it matches the current period
      return isSameDay(taskPeriodStart, periodConfig.anchorDate)
    })
  }

  const getListsForDay = (targetDate: Date): ListModel[] => {
    const targetDayStart = startOfDay(targetDate)
    const todayStart = startOfDay(TODAY)
    const isTargetToday = isSameDay(targetDate, TODAY)

    return lists.filter((list) => {
      if (!list.scheduledDate) return false
      if (list.scheduledDate.periodType !== 'day') return false

      const listDate = startOfDay(list.scheduledDate.anchorDate)

      // If target is today, show today's lists AND past lists (rollover)
      if (isTargetToday) {
        return isSameDay(listDate, todayStart) || isBefore(listDate, todayStart)
      }

      // For future days, only show lists scheduled for that specific day
      return isSameDay(listDate, targetDayStart)
    })
  }

  const getListsForPeriod = (period: string): ListModel[] => {
    const periodConfig = PERIOD_TO_TYPE[period]
    if (!periodConfig) return []

    return lists.filter((list) => {
      if (!list.scheduledDate) return false
      if (list.scheduledDate.periodType !== periodConfig.periodType) return false

      const listPeriodStart = list.scheduledDate.anchorDate

      // Rollover: if scheduled for past period, show in current period
      if (isBefore(listPeriodStart, periodConfig.anchorDate)) {
        return true
      }

      // Otherwise, check if it matches the current period
      return isSameDay(listPeriodStart, periodConfig.anchorDate)
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-gray-300">
      {/* Days of the week - 5 columns */}
      <div className="grid flex-1 grid-cols-5 gap-px">
        {NEXT_5_DAYS.map((day) => {
          const dayTasks = getTasksForDay(day.date)
          const dayLists = getListsForDay(day.date)
          return (
            <div
              key={day.dateString}
              className={`flex flex-col p-4 ${
                isToday(day.date) ? 'bg-blue-50' : isWeekend(day.name) ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <h2
                className={`mb-4 font-semibold text-sm ${
                  isToday(day.date)
                    ? 'text-blue-900'
                    : isWeekend(day.name)
                      ? 'text-gray-500'
                      : 'text-gray-900'
                }`}
              >
                <div>{day.name}</div>
                <div className="font-normal text-gray-500 text-xs">{day.displayDate}</div>
              </h2>
              <div className="space-y-2">
                {/* Scheduled Lists */}
                {dayLists.map((list) => {
                  const IconComponent =
                    list.type === 'area' ? Folder : list.type === 'project' ? null : ListIcon
                  return (
                    <div
                      key={list.id}
                      className="flex items-center gap-2 rounded bg-blue-100 p-2 font-medium text-blue-900 text-sm"
                    >
                      {list.type === 'project' ? (
                        <ProjectIcon
                          size={14}
                          className="shrink-0"
                          percentage={list.completionPercentage ?? 0}
                        />
                      ) : IconComponent ? (
                        <IconComponent size={14} className="shrink-0" />
                      ) : null}
                      <span className="flex-1">{list.name}</span>
                    </div>
                  )
                })}

                {/* Tasks */}
                {dayTasks.map((task) => (
                  <label
                    key={task.id}
                    className={`flex cursor-pointer items-start gap-2 text-sm ${
                      isWeekend(day.name) ? 'text-gray-500' : 'text-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={taskStates[task.id]}
                      onChange={() => toggleTask(task.id)}
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1">{task.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Time periods - 3 columns */}
      <div className="mt-px grid grid-cols-3 gap-px">
        {TIME_PERIODS.map((period) => {
          const periodTasks = getTasksForPeriod(period)
          const periodLists = getListsForPeriod(period)
          return (
            <div key={period} className="flex flex-col bg-white p-4">
              <h2 className="mb-4 font-semibold text-gray-900 text-sm">{period}</h2>
              <div className="space-y-2">
                {/* Scheduled Lists */}
                {periodLists.map((list) => {
                  const IconComponent =
                    list.type === 'area' ? Folder : list.type === 'project' ? null : ListIcon
                  return (
                    <div
                      key={list.id}
                      className="flex items-center gap-2 rounded bg-blue-100 p-2 font-medium text-blue-900 text-sm"
                    >
                      {list.type === 'project' ? (
                        <ProjectIcon
                          size={14}
                          className="shrink-0"
                          percentage={list.completionPercentage ?? 0}
                        />
                      ) : IconComponent ? (
                        <IconComponent size={14} className="shrink-0" />
                      ) : null}
                      <span className="flex-1">{list.name}</span>
                    </div>
                  )
                })}

                {/* Tasks */}
                {periodTasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex cursor-pointer items-start gap-2 text-gray-700 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={taskStates[task.id]}
                      onChange={() => toggleTask(task.id)}
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1">{task.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
