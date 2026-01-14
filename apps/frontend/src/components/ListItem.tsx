import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import clsx from 'clsx'
import { DotIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { Link, useMatch } from 'react-router-dom'
import type { ListModel } from 'shared'
import { twMerge } from 'tailwind-merge'
import { useRootStore } from '../models/RootStoreContext'
import { HexagonIcon } from './HexagonIcon'
import { ListItemContextMenu } from './ListItemContextMenu'
import { ProjectIcon } from './ProjectIcon'

interface ListItemProps {
  list: ListModel
  isNested?: boolean
  nestingLevel?: number
}

export const ListItem = observer(({ list, isNested = false, nestingLevel = 0 }: ListItemProps) => {
  const store = useRootStore()
  const match = useMatch(`/list/${list.id}`)
  const isActive = !!match
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(list.name)
  const [isOver, setIsOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const IconComponent =
    list.type === 'area' ? HexagonIcon : list.type === 'project' ? null : DotIcon

  // Calculate margin based on nesting level (0 = no nesting, 1 = ml-6, 2 = ml-12)
  const nestingClass =
    nestingLevel === 2 ? 'ml-12' : nestingLevel === 1 ? 'ml-6' : isNested ? 'ml-6' : ''

  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Small delay to ensure context menu is fully closed before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isEditing])

  useEffect(() => {
    const element = dropRef.current
    if (!element) return

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => {
        return source.data.type === 'task'
      },
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: async ({ source }) => {
        setIsOver(false)
        const taskId = source.data.taskId as string
        const task = store.tasks.find((t) => t.id === taskId)
        if (task) {
          await task.moveToList(list.id)
        }
      },
    })
  }, [list.id, store])

  const handleSave = async () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== list.name) {
      await list.updateName(trimmedValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(list.name)
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

  const handleStartRename = () => {
    setEditValue(list.name)
    setIsEditing(true)
  }

  return (
    <div ref={dropRef}>
      <ListItemContextMenu list={list} onRename={handleStartRename}>
        {isEditing ? (
          <div
            className={twMerge(
              clsx(
                'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-neutral-light',
                {
                  [nestingClass]: nestingClass,
                  'bg-neutral-light font-medium text-gray-900': isActive,
                  'bg-blue-50': isOver,
                },
              ),
            )}
          >
            {list.type === 'project' ? (
              <ProjectIcon
                size={16}
                className="shrink-0 text-gray-500"
                percentage={list.completionPercentage ?? 0}
              />
            ) : IconComponent ? (
              <IconComponent size={16} className="shrink-0 text-gray-500" />
            ) : null}
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleCancel}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        ) : (
          <Link
            to={`/list/${list.id}`}
            className={twMerge(
              clsx(
                'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-neutral-light',
                {
                  [nestingClass]: nestingClass,
                  'bg-neutral-light font-medium text-gray-900': isActive,
                  'bg-blue-50': isOver,
                },
              ),
            )}
          >
            {list.type === 'project' ? (
              <ProjectIcon
                size={16}
                className="shrink-0 text-gray-500"
                percentage={list.completionPercentage ?? 0}
              />
            ) : IconComponent ? (
              <IconComponent size={16} className="shrink-0 text-gray-500" />
            ) : null}
            <span className="flex-1 truncate">{list.name}</span>
            {/* {list.numberOfOpenTasks > 0 && (
            <span className="ml-2 shrink-0 rounded-full bg-gray-200 px-2 py-0.5 font-medium text-gray-600 text-xs">
              {list.numberOfOpenTasks}
            </span>
          )} */}
          </Link>
        )}
      </ListItemContextMenu>
    </div>
  )
})
