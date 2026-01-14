import * as ContextMenu from '@radix-ui/react-context-menu'
import { DotIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import type { ListModel } from 'shared'
import { useRootStore } from '../models/RootStoreContext'
import { handleSchedule, scheduleOptions } from '../utils/scheduleOptions'
import { HexagonIcon } from './HexagonIcon'
import { ProjectIcon } from './ProjectIcon'

interface ListItemContextMenuProps {
  list: ListModel
  children: React.ReactNode
  onRename: () => void
}

export const ListItemContextMenu = observer(
  ({ list, children, onRename }: ListItemContextMenuProps) => {
    const store = useRootStore()
    const areas = store.areas
    const regularLists = store.lists.filter((l) => l.type === 'list')

    return (
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content className="z-[60] min-w-50 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
            <ContextMenu.Item
              className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
              onSelect={onRename}
            >
              Rename
            </ContextMenu.Item>

            <ContextMenu.Separator className="my-1 h-px bg-gray-200" />

            <ContextMenu.Item
              className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
              onSelect={() => list.setOnIce(!list.onIce)}
            >
              {list.onIce ? 'Remove from Ice' : 'Put on Ice'}
            </ContextMenu.Item>

            <ContextMenu.Separator className="my-1 h-px bg-gray-200" />

            {list.isArea && (
              <ContextMenu.Item
                className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                onSelect={() => {
                  store.setFocusedArea(list.id)
                }}
              >
                Focus
              </ContextMenu.Item>
            )}

            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
                Schedule
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent className="z-[60] min-w-45 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
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
                  <ContextMenu.SubContent className="z-[60] max-h-96 min-w-[180px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
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

            {/* Create Child submenu - only for areas and regular lists */}
            {!list.isProject && (
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
                  Create Child
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className="z-[60] min-w-[140px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                    {/* Areas can create projects and lists */}
                    {list.isArea && (
                      <>
                        <ContextMenu.Item
                          className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                          onSelect={() => {
                            const name = window.prompt('Enter project name:')
                            if (name?.trim()) {
                              store.createList(name.trim(), 'project', list.id)
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <ProjectIcon
                              size={14}
                              className="shrink-0 text-gray-500"
                              percentage={0}
                            />
                            <span>Project</span>
                          </div>
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                          onSelect={() => {
                            const name = window.prompt('Enter list name:')
                            if (name?.trim()) {
                              store.createList(name.trim(), 'list', list.id)
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <DotIcon size={14} className="shrink-0 text-gray-500" />
                            <span>List</span>
                          </div>
                        </ContextMenu.Item>
                      </>
                    )}
                    {/* Regular lists can only create projects */}
                    {list.isList && (
                      <ContextMenu.Item
                        className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                        onSelect={() => {
                          const name = window.prompt('Enter project name:')
                          if (name?.trim()) {
                            store.createList(name.trim(), 'project', list.id)
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <ProjectIcon
                            size={14}
                            className="shrink-0 text-gray-500"
                            percentage={0}
                          />
                          <span>Project</span>
                        </div>
                      </ContextMenu.Item>
                    )}
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
            )}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
    )
  },
)
