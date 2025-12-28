import * as Popover from '@radix-ui/react-popover'
import { CheckIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../models/RootStore'
import type { TaskModel } from '../models/TaskModel'
import { HexagonIcon } from './HexagonIcon'
import { ProjectIcon } from './ProjectIcon'

interface TaskListPopoverProps {
  task: TaskModel
  children: React.ReactNode
}

export const TaskListPopover = observer(({ task, children }: TaskListPopoverProps) => {
  const store = useRootStore()
  const areas = store.areas
  const standaloneLists = store.getStandaloneLists()

  const handleMoveToList = async (listId: string | null) => {
    await task.moveToList(listId)
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 max-h-96 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          sideOffset={5}
          side="bottom"
          align="start"
        >
          {/* <div className="mb-2 px-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
            Move to List
          </div> */}
          <div className="space-y-1">
            {/* Inbox option (no list) */}
            <button
              type="button"
              onClick={() => handleMoveToList(null)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-gray-700 text-sm hover:bg-gray-100"
            >
              <span className="flex-1">Inbox</span>
              {!task.listId && <CheckIcon size={14} className="text-gray-400" />}
            </button>

            {/* Standalone lists */}
            {standaloneLists
              .filter((list) => !list.archived)
              .map((list) => {
                const IconComponent = list.type === 'area' ? HexagonIcon : null
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => handleMoveToList(list.id)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-gray-700 text-sm hover:bg-gray-100"
                  >
                    {IconComponent &&
                      (list.type === 'project' ? (
                        <ProjectIcon
                          size={14}
                          className="shrink-0 text-gray-500"
                          percentage={list.completionPercentage ?? 0}
                        />
                      ) : (
                        <IconComponent size={14} className="shrink-0 text-gray-500" />
                      ))}
                    <span className="flex-1">{list.name}</span>
                    {task.listId === list.id && <CheckIcon size={14} className="text-gray-400" />}
                  </button>
                )
              })}

            {/* Areas with children */}
            {areas.map((area) => (
              <div key={area.id}>
                <button
                  type="button"
                  onClick={() => handleMoveToList(area.id)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-gray-700 text-sm hover:bg-gray-100"
                >
                  <HexagonIcon size={14} className="shrink-0 text-gray-500" />
                  <span className="flex-1">{area.name}</span>
                  {task.listId === area.id && <CheckIcon size={14} className="text-gray-400" />}
                </button>
                {/* Child lists */}
                {store
                  .getChildLists(area.id)
                  .filter((childList) => !childList.archived)
                  .map((childList) => {
                    const IconComponent = childList.type === 'project' ? ProjectIcon : null
                    return (
                      <button
                        key={childList.id}
                        type="button"
                        onClick={() => handleMoveToList(childList.id)}
                        className="ml-6 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-gray-700 text-sm hover:bg-gray-100"
                      >
                        {IconComponent && (
                          <IconComponent
                            size={14}
                            className="shrink-0 text-gray-500"
                            percentage={childList.completionPercentage ?? 0}
                          />
                        )}
                        <span className="flex-1">{childList.name}</span>
                        {task.listId === childList.id && (
                          <CheckIcon size={14} className="text-gray-400" />
                        )}
                      </button>
                    )
                  })}
              </div>
            ))}
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
})
