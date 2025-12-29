import { ArrowRightIcon, CheckIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import type { TaskModel } from '../models/TaskModel'
import { RoundedSquareFilledIcon } from './RoundedSquareFilledIcon'
import { RoundedSquareIcon } from './RoundedSquareIcon'
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
}

export const TaskItem = observer(({ task, showList }: TaskItemProps) => {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

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
    <div className="group flex items-center gap-2 rounded-lg p-2 hover:bg-gray-50">
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
  )
})
