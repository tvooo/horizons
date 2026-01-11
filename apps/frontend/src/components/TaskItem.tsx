import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { ArrowRightIcon, CheckIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PeriodType, TaskModel } from 'shared'
import { generateFractionalIndex } from 'shared'
import { twMerge } from 'tailwind-merge'
import { RoundedSquareFilledIcon } from './RoundedSquareFilledIcon'
import { RoundedSquareIcon } from './RoundedSquareIcon'
import { TaskItemContextMenu } from './TaskItemContextMenu'
import { TaskListPopover } from './TaskListPopover'
import { TaskSchedulePopover } from './TaskSchedulePopover'

export interface TaskCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TaskCheckbox = ({ checked, onChange, className, ...props }: TaskCheckboxProps) => {
  return (
    <label
      className={twMerge(
        'relative size-4 cursor-pointer text-gray-400 hover:text-today',
        className,
      )}
    >
      <input
        type="checkbox"
        className="invisible absolute size-0 text-today focus:ring-today"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      {checked ? (
        <>
          <RoundedSquareFilledIcon size={16} className="absolute top-0 left-0 text-today" />
          <CheckIcon
            strokeWidth={3}
            className="absolute top-0.5 left-0.5 z-10 text-white"
            size={12}
          />
        </>
      ) : (
        <RoundedSquareIcon size={16} />
      )}
    </label>
  )
}

interface TaskItemProps {
  task: TaskModel
  showList?: boolean
  periodType?: PeriodType
  tasksInPeriod?: TaskModel[]
  indexInPeriod?: number
}

export const TaskItem = observer(
  ({ task, showList, periodType, tasksInPeriod, indexInPeriod }: TaskItemProps) => {
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(task.title)
    const [isDragging, setIsDragging] = useState(false)
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const taskRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    useEffect(() => {
      const element = taskRef.current
      if (!element) return

      const cleanupDraggable = draggable({
        element,
        getInitialData: () => ({
          type: 'task',
          taskId: task.id,
          periodType,
          scheduleOrder: task.scheduleOrder,
        }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      })

      // Only set up drop target if we have the reordering context (periodType and tasksInPeriod)
      if (!periodType || !tasksInPeriod || indexInPeriod === undefined) {
        return cleanupDraggable
      }

      const cleanupDropTarget = dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          // Only allow reordering within the same period
          return source.data.type === 'task' && source.data.periodType === periodType
        },
        getData: ({ input }) => {
          return attachClosestEdge(
            {
              type: 'task',
              taskId: task.id,
            },
            {
              element,
              input,
              allowedEdges: ['top', 'bottom'],
            },
          )
        },
        onDragEnter: ({ self }) => {
          const edge = extractClosestEdge(self.data)
          setClosestEdge(edge)
        },
        onDrag: ({ self }) => {
          const edge = extractClosestEdge(self.data)
          setClosestEdge(edge)
        },
        onDragLeave: () => {
          setClosestEdge(null)
        },
        onDrop: async ({ source, self }) => {
          setClosestEdge(null)

          const draggedTaskId = source.data.taskId as string
          if (draggedTaskId === task.id) return // Can't drop on self

          const edge = extractClosestEdge(self.data)
          if (!edge) return

          // Calculate new fractional index
          let newScheduleOrder: string
          const currentIndex = indexInPeriod

          if (edge === 'top') {
            // Insert before current task
            const beforeTask = currentIndex > 0 ? tasksInPeriod[currentIndex - 1] : null
            newScheduleOrder = generateFractionalIndex(
              beforeTask?.scheduleOrder || null,
              task.scheduleOrder,
            )
          } else {
            // Insert after current task (edge === 'bottom')
            const afterTask =
              currentIndex < tasksInPeriod.length - 1 ? tasksInPeriod[currentIndex + 1] : null
            newScheduleOrder = generateFractionalIndex(
              task.scheduleOrder,
              afterTask?.scheduleOrder || null,
            )
          }

          // Find the dragged task and update its scheduleOrder
          const draggedTask = tasksInPeriod.find((t) => t.id === draggedTaskId)
          if (draggedTask) {
            await draggedTask.updateScheduleOrder(newScheduleOrder)
          }
        },
      })

      return () => {
        cleanupDraggable()
        cleanupDropTarget()
      }
    }, [task.id, task.scheduleOrder, periodType, tasksInPeriod, indexInPeriod])

    const handleSave = async () => {
      const trimmedValue = editValue.trim()
      if (trimmedValue && trimmedValue !== task.title) {
        await task.updateTitle(trimmedValue)
      }
      setIsEditing(false)
    }

    const handleCancel = () => {
      setEditValue(task.title)
      setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }

    return (
      <TaskItemContextMenu task={task}>
        <div
          ref={taskRef}
          className={twMerge(
            'group relative flex items-center gap-2 rounded-lg p-2 hover:bg-gray-50',
            isDragging && 'cursor-grabbing opacity-50',
            closestEdge === 'top' &&
              'before:absolute before:top-0 before:right-0 before:left-0 before:h-0.5 before:bg-blue-500',
            closestEdge === 'bottom' &&
              'after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-blue-500',
          )}
        >
          <TaskCheckbox checked={task.completed} onChange={() => task.toggleCompleted()} />

          <div className="flex-1 text-sm">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleCancel}
                onKeyDown={handleKeyDown}
                className={`w-full bg-transparent outline-none ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}
              />
            ) : (
              // biome-ignore lint/a11y/noStaticElementInteractions: Need to think about how to improve this
              // biome-ignore lint/a11y/useKeyWithClickEvents: See above
              <span
                className={`cursor-text ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                onClick={() => {
                  setEditValue(task.title)
                  setIsEditing(true)
                }}
              >
                {task.title}
              </span>
            )}
            {showList && task.list && (
              <div className="flex items-center gap-1 text-xs">
                <TaskListPopover task={task}>
                  <button
                    type="button"
                    className="-m-1 p-1 text-gray-400 text-xs hover:bg-gray-100 hover:text-gray-600"
                  >
                    <span>{task.list.name}</span>
                  </button>
                </TaskListPopover>
                <button
                  type="button"
                  className="p-1 text-gray-400 text-xs opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 focus:opacity-100 group-hover:opacity-100"
                  onClick={() => navigate(`/list/${task.list?.id}`)}
                >
                  <ArrowRightIcon size={12} />
                </button>
              </div>
            )}
          </div>

          <TaskSchedulePopover task={task} />
        </div>
      </TaskItemContextMenu>
    )
  },
)
