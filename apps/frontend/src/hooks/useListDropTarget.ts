import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useRef, useState } from 'react'
import type { ListModel } from 'shared'
import { useRootStore } from '../models/RootStoreContext'

export function useListDropTarget(list: ListModel) {
  const store = useRootStore()
  const [isOver, setIsOver] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

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

  return {
    isOver,
    dropRef,
  }
}
