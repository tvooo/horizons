import clsx from 'clsx'
import { ChevronRight, DotIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Children, useState } from 'react'
import { Link, useMatch } from 'react-router-dom'
import type { ListModel } from 'shared'
import { twMerge } from 'tailwind-merge'
import { useListDropTarget } from '../../hooks/useListDropTarget'
import { useListItemEditing } from '../../hooks/useListItemEditing'
import { HexagonIcon } from '../HexagonIcon'
import { ListItemContextMenu } from '../ListItemContextMenu'
import { ProjectIcon } from '../ProjectIcon'

interface SidebarListItemProps {
  list: ListModel
  nestingLevel?: number
  children?: React.ReactNode
}

function getCollapsedKey(listId: string) {
  return `sidebar-collapsed-${listId}`
}

function getInitialCollapsed(listId: string): boolean {
  const stored = localStorage.getItem(getCollapsedKey(listId))
  return stored === 'true'
}

export const SidebarListItem = observer(
  ({ list, nestingLevel = 0, children }: SidebarListItemProps) => {
    const match = useMatch(`/list/${list.id}`)
    const isActive = !!match
    const { isOver, dropRef } = useListDropTarget(list)
    const {
      isEditing,
      editValue,
      setEditValue,
      inputRef,
      handleCancel,
      handleKeyDown,
      handleStartRename,
    } = useListItemEditing(list)

    const [isCollapsed, setIsCollapsed] = useState(() => getInitialCollapsed(list.id))

    const hasChildren = Children.count(children) > 0
    const isCollapsible = list.isArea && hasChildren

    const toggleCollapsed = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const newValue = !isCollapsed
      setIsCollapsed(newValue)
      localStorage.setItem(getCollapsedKey(list.id), String(newValue))
    }

    const IconComponent =
      list.type === 'area' ? HexagonIcon : list.type === 'project' ? null : DotIcon

    const nestingClass = nestingLevel === 2 ? 'ml-12' : nestingLevel === 1 ? 'ml-6' : ''

    const baseClasses =
      'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-neutral-light'

    const renderIcon = () => {
      if (list.type === 'project') {
        return (
          <ProjectIcon
            size={16}
            className="shrink-0 text-gray-500"
            percentage={list.completionPercentage ?? 0}
          />
        )
      }
      if (IconComponent) {
        return <IconComponent size={16} className="shrink-0 text-gray-500" />
      }
      return null
    }

    const renderChevron = () => {
      if (!isCollapsible) return null
      return (
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 hover:text-gray-600 group-hover/sidebar:opacity-100"
        >
          <ChevronRight
            size={14}
            className={clsx('transition-transform', { 'rotate-90': !isCollapsed })}
          />
        </button>
      )
    }

    return (
      <div ref={dropRef}>
        <ListItemContextMenu list={list} onRename={handleStartRename}>
          {isEditing ? (
            <div
              className={twMerge(
                clsx(baseClasses, {
                  [nestingClass]: nestingClass,
                  'bg-neutral-light font-medium text-gray-900': isActive,
                  'bg-blue-50': isOver,
                }),
              )}
            >
              {renderIcon()}
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleCancel}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none"
              />
              {renderChevron()}
            </div>
          ) : (
            <Link
              to={`/list/${list.id}`}
              className={twMerge(
                clsx(baseClasses, {
                  [nestingClass]: nestingClass,
                  'bg-neutral-light font-medium text-gray-900': isActive,
                  'bg-blue-50': isOver,
                }),
              )}
            >
              {renderIcon()}
              <span className="flex-1 truncate">{list.name}</span>
              {renderChevron()}
            </Link>
          )}
        </ListItemContextMenu>

        {hasChildren && !isCollapsed && children}
      </div>
    )
  },
)
