import * as ContextMenu from '@radix-ui/react-context-menu'
import { CheckIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import type { TaskModel } from 'shared'
import { useRootStore } from '../models/RootStoreContext'
import { handleSchedule, scheduleOptions } from '../utils/scheduleOptions'
import { HexagonIcon } from './HexagonIcon'
import { ProjectIcon } from './ProjectIcon'
import { ScheduleCalendar } from './ScheduleCalendar'

interface TaskItemContextMenuProps {
  task: TaskModel
  children: React.ReactNode
}

export const TaskItemContextMenu = observer(({ task, children }: TaskItemContextMenuProps) => {
  const store = useRootStore()
  const areas = store.areas
  const standaloneLists = store.getStandaloneLists()

  const handleMoveToList = async (listId: string | null) => {
    await task.moveToList(listId)
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-50 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
              Schedule
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="min-w-45 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                {/* Day options */}
                {scheduleOptions
                  .filter((opt) => opt.periodType === 'day')
                  .map((option) => (
                    <div key={option.label}>
                      <ContextMenu.Item
                        className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                        onSelect={() =>
                          handleSchedule(
                            (periodType, anchorDate) =>
                              task.updateScheduledDate(periodType, anchorDate),
                            option.periodType,
                            option.getDaysOffset(),
                          )
                        }
                      >
                        {option.label}
                      </ContextMenu.Item>
                    </div>
                  ))}

                {/* Calendar view */}
                <ContextMenu.Separator className="my-1 h-px bg-gray-200" />
                <ScheduleCalendar
                  onSelectDate={(date) => {
                    task.updateScheduledDate('day', date)
                  }}
                />

                {/* Week, month, quarter, year options */}
                {scheduleOptions
                  .filter((opt) => opt.periodType !== 'day')
                  .map((option) => (
                    <div key={option.label}>
                      {option.separator && (
                        <ContextMenu.Separator className="my-1 h-px bg-gray-200" />
                      )}
                      <ContextMenu.Item
                        className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                        onSelect={() =>
                          handleSchedule(
                            (periodType, anchorDate) =>
                              task.updateScheduledDate(periodType, anchorDate),
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

          <ContextMenu.Separator className="my-1 h-px bg-gray-200" />

          <ContextMenu.Item
            className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
            onSelect={() => task.setOnIce(!task.onIce)}
          >
            {task.onIce ? 'Remove from Ice' : 'Put on Ice'}
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1 h-px bg-gray-200" />

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
              Move to List
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal>
              <ContextMenu.SubContent className="max-h-96 min-w-[180px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                <ContextMenu.Item
                  className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                  onSelect={() => handleMoveToList(null)}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1">Inbox</span>
                    {!task.listId && <CheckIcon size={14} className="text-gray-400" />}
                  </div>
                </ContextMenu.Item>

                {/* Standalone lists */}
                {standaloneLists
                  .filter((list) => !list.archived)
                  .map((list) => {
                    const IconComponent = list.type === 'area' ? HexagonIcon : null
                    return (
                      <div key={list.id}>
                        <ContextMenu.Item
                          className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                          onSelect={() => handleMoveToList(list.id)}
                        >
                          <div className="flex items-center gap-2">
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
                            {task.listId === list.id && (
                              <CheckIcon size={14} className="text-gray-400" />
                            )}
                          </div>
                        </ContextMenu.Item>
                        {/* Projects nested under standalone lists */}
                        {list.type === 'list' &&
                          store
                            .getChildLists(list.id)
                            .filter((childList) => !childList.archived)
                            .map((childList) => (
                              <ContextMenu.Item
                                key={childList.id}
                                className="cursor-pointer rounded px-3 py-2 pl-9 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                                onSelect={() => handleMoveToList(childList.id)}
                              >
                                <div className="flex items-center gap-2">
                                  {childList.type === 'project' && (
                                    <ProjectIcon
                                      size={14}
                                      className="shrink-0 text-gray-500"
                                      percentage={childList.completionPercentage ?? 0}
                                    />
                                  )}
                                  <span className="flex-1">{childList.name}</span>
                                  {task.listId === childList.id && (
                                    <CheckIcon size={14} className="text-gray-400" />
                                  )}
                                </div>
                              </ContextMenu.Item>
                            ))}
                      </div>
                    )
                  })}

                {/* Areas with children */}
                {areas.map((area) => (
                  <div key={area.id}>
                    <ContextMenu.Item
                      className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                      onSelect={() => handleMoveToList(area.id)}
                    >
                      <div className="flex items-center gap-2">
                        <HexagonIcon size={14} className="shrink-0 text-gray-500" />
                        <span className="flex-1">{area.name}</span>
                        {task.listId === area.id && (
                          <CheckIcon size={14} className="text-gray-400" />
                        )}
                      </div>
                    </ContextMenu.Item>
                    {/* Child lists and their nested projects */}
                    {store
                      .getChildLists(area.id)
                      .filter((childList) => !childList.archived)
                      .map((childList) => {
                        const IconComponent = childList.type === 'project' ? ProjectIcon : null
                        return (
                          <div key={childList.id}>
                            <ContextMenu.Item
                              className="cursor-pointer rounded px-3 py-2 pl-9 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                              onSelect={() => handleMoveToList(childList.id)}
                            >
                              <div className="flex items-center gap-2">
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
                              </div>
                            </ContextMenu.Item>
                            {/* Projects nested under lists (third level) */}
                            {childList.type === 'list' &&
                              store
                                .getChildLists(childList.id)
                                .filter((grandchildList) => !grandchildList.archived)
                                .map((grandchildList) => (
                                  <ContextMenu.Item
                                    key={grandchildList.id}
                                    className="cursor-pointer rounded px-3 py-2 pl-[60px] text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                                    onSelect={() => handleMoveToList(grandchildList.id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {grandchildList.type === 'project' && (
                                        <ProjectIcon
                                          size={14}
                                          className="shrink-0 text-gray-500"
                                          percentage={grandchildList.completionPercentage ?? 0}
                                        />
                                      )}
                                      <span className="flex-1">{grandchildList.name}</span>
                                      {task.listId === grandchildList.id && (
                                        <CheckIcon size={14} className="text-gray-400" />
                                      )}
                                    </div>
                                  </ContextMenu.Item>
                                ))}
                          </div>
                        )
                      })}
                  </div>
                ))}
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
})
