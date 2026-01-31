import clsx from 'clsx'
import { DotIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Link, useMatch } from 'react-router-dom'
import type { ListModel } from 'shared'
import { twMerge } from 'tailwind-merge'
import { useListDropTarget } from '../hooks/useListDropTarget'
import { useListItemEditing } from '../hooks/useListItemEditing'
import { HexagonIcon } from './HexagonIcon'
import { ListItemContextMenu } from './ListItemContextMenu'
import { ProjectIcon } from './ProjectIcon'

interface ListItemProps {
  list: ListModel
}

export const ListItem = observer(({ list }: ListItemProps) => {
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

  const IconComponent =
    list.type === 'area' ? HexagonIcon : list.type === 'project' ? null : DotIcon

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

  return (
    <div ref={dropRef}>
      <ListItemContextMenu list={list} onRename={handleStartRename}>
        {isEditing ? (
          <div
            className={twMerge(
              clsx(baseClasses, {
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
          </div>
        ) : (
          <Link
            to={`/list/${list.id}`}
            className={twMerge(
              clsx(baseClasses, {
                'bg-neutral-light font-medium text-gray-900': isActive,
                'bg-blue-50': isOver,
              }),
            )}
          >
            {renderIcon()}
            <span className="flex-1 truncate">{list.name}</span>
          </Link>
        )}
      </ListItemContextMenu>
    </div>
  )
})
