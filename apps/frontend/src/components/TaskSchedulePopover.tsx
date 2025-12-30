import * as Popover from '@radix-ui/react-popover'
import { CalendarDays } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { scheduledDateLabel, type TaskModel } from 'shared'
import { twMerge } from 'tailwind-merge'
import { handleSchedule, scheduleOptions } from '../utils/scheduleOptions'

interface TaskSchedulePopoverProps {
  task: TaskModel
}

export const TaskSchedulePopover = observer(({ task }: TaskSchedulePopoverProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={twMerge(
            'shrink-0 rounded p-1 text-gray-400 text-xs hover:bg-gray-100 hover:text-gray-600 focus:opacity-100',
            !task.scheduledDate && 'opacity-0 group-hover:opacity-100',
          )}
          aria-label="Schedule task"
          type="button"
        >
          {task.scheduledDate ? scheduledDateLabel(task.scheduledDate) : <CalendarDays size={16} />}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          sideOffset={5}
          side="bottom"
          align="end"
        >
          <div className="space-y-1">
            {scheduleOptions.map((option, _index) => (
              <div key={option.label}>
                {option.separator && <div className="my-1 border-gray-200 border-t" />}
                <button
                  type="button"
                  onClick={() =>
                    handleSchedule(
                      (periodType, anchorDate) => task.updateScheduledDate(periodType, anchorDate),
                      option.periodType,
                      option.getDaysOffset(),
                    )
                  }
                  className="w-full rounded px-3 py-2 text-left text-gray-700 text-sm hover:bg-gray-100"
                >
                  {option.label}
                </button>
              </div>
            ))}
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
})
