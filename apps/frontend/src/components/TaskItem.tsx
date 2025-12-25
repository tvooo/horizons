import * as Popover from '@radix-ui/react-popover'
import { CalendarDays } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import type { TaskModel } from '../models/TaskModel'

interface TaskItemProps {
  task: TaskModel
}

export const TaskItem = observer(({ task }: TaskItemProps) => {
  const handleSchedule = async (periodType: 'day' | 'week' | 'month', daysOffset: number) => {
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

    await task.updateScheduledDate(periodType, anchorDate)
  }

  return (
    <div className="group flex items-start gap-3 rounded-lg p-3 hover:bg-gray-50">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => task.toggleCompleted()}
        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="flex-1">
        <span className={`${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
          {task.title}
        </span>
        {task.description && <p className="mt-1 text-gray-500 text-sm">{task.description}</p>}
        {task.scheduledDate && (
          <p className="mt-1 text-gray-400 text-xs">
            Scheduled: {task.scheduledDate.anchorDate.toLocaleDateString()} (
            {task.scheduledDate.periodType})
          </p>
        )}
      </div>

      {/* Schedule Button with Popover */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="flex-shrink-0 rounded p-1 text-gray-400 opacity-0 hover:bg-gray-100 hover:text-gray-600 focus:opacity-100 group-hover:opacity-100"
            aria-label="Schedule task"
            type="button"
          >
            <CalendarDays size={16} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
            sideOffset={5}
          >
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleSchedule('day', 0)}
                className="w-full rounded px-3 py-2 text-left text-gray-700 text-sm hover:bg-gray-100"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleSchedule('day', 1)}
                className="w-full rounded px-3 py-2 text-left text-gray-700 text-sm hover:bg-gray-100"
              >
                Tomorrow
              </button>
              <div className="my-1 border-gray-200 border-t" />
              <button
                type="button"
                onClick={() => handleSchedule('week', 0)}
                className="w-full rounded px-3 py-2 text-left text-gray-700 text-sm hover:bg-gray-100"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => handleSchedule('week', 7)}
                className="w-full rounded px-3 py-2 text-left text-gray-700 text-sm hover:bg-gray-100"
              >
                Next Week
              </button>
              <div className="my-1 border-gray-200 border-t" />
              <button
                type="button"
                onClick={() => handleSchedule('month', 0)}
                className="w-full rounded px-3 py-2 text-left text-gray-700 text-sm hover:bg-gray-100"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextMonth = new Date()
                  nextMonth.setMonth(nextMonth.getMonth() + 1)
                  const daysToNextMonth = Math.ceil(
                    (nextMonth.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  )
                  handleSchedule('month', daysToNextMonth)
                }}
                className="w-full rounded px-3 py-2 text-left text-gray-700 text-sm hover:bg-gray-100"
              >
                Next Month
              </button>
            </div>
            <Popover.Arrow className="fill-white" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
})
