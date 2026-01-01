import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import * as ContextMenu from '@radix-ui/react-context-menu'
import clsx from 'clsx'
import { DotIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { Link, useMatch } from 'react-router-dom'
import type { ListModel } from 'shared'
import { twMerge } from 'tailwind-merge'
import { useRootStore } from '../models/RootStoreContext'
import { handleSchedule, scheduleOptions } from '../utils/scheduleOptions'
import { HexagonIcon } from './HexagonIcon'
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

  const areas = store.areas
  const regularLists = store.lists.filter((l) => l.type === 'list')

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

  return (
    <div ref={dropRef}>
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
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
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="min-w-50 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
            <ContextMenu.Item
              className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
              onSelect={() => {
                setEditValue(list.name)
                setIsEditing(true)
              }}
            >
              Rename
            </ContextMenu.Item>

            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
                Schedule
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent className="min-w-45 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                  {scheduleOptions.map((option) => (
                    <div key={option.label}>
                      {option.separator && (
                        <ContextMenu.Separator className="my-1 h-px bg-gray-200" />
                      )}
                      <ContextMenu.Item
                        className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                        onSelect={() =>
                          handleSchedule(
                            (periodType, anchorDate) =>
                              list.updateScheduledDate(periodType, anchorDate),
                            option.periodType,
                            option.getDaysOffset(),
                          )
                        }
                      >
                        {option.label}
                      </ContextMenu.Item>
                    </div>
                  ))}
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>

            {!list.isArea && (
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
                  Set Parent List
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className="max-h-96 min-w-[180px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                    <ContextMenu.Item
                      className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                      onSelect={() => {
                        store.updateListParent(list.id, null)
                      }}
                    >
                      None
                    </ContextMenu.Item>

                    {/* Areas as parent candidates */}
                    {areas.length === 0 && list.type === 'list' ? (
                      <div className="px-3 py-2 text-gray-500 text-sm">No areas available</div>
                    ) : (
                      areas
                        .filter((area) => area.id !== list.id)
                        .map((area) => (
                          <ContextMenu.Item
                            key={area.id}
                            className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                            onSelect={() => {
                              store.updateListParent(list.id, area.id)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <HexagonIcon size={14} className="shrink-0 text-gray-500" />
                              <span>{area.name}</span>
                            </div>
                          </ContextMenu.Item>
                        ))
                    )}

                    {/* Regular lists as parent candidates (only for projects) */}
                    {list.type === 'project' &&
                      regularLists
                        .filter((l) => l.id !== list.id && !l.archived)
                        .map((regularList) => (
                          <ContextMenu.Item
                            key={regularList.id}
                            className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                            onSelect={() => {
                              store.updateListParent(list.id, regularList.id)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <DotIcon size={14} className="shrink-0 text-gray-500" />
                              <span>{regularList.name}</span>
                            </div>
                          </ContextMenu.Item>
                        ))}
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
            )}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    </div>
  )
})
