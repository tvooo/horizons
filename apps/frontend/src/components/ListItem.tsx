import * as ContextMenu from '@radix-ui/react-context-menu'
import clsx from 'clsx'
import { DotIcon } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { Link, useMatch } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import type { ListModel } from '../models/ListModel'
import { useRootStore } from '../models/RootStore'
import { HexagonIcon } from './HexagonIcon'
import { ProjectIcon } from './ProjectIcon'

interface ListItemProps {
  list: ListModel
  isNested?: boolean
}

export const ListItem = observer(({ list, isNested = false }: ListItemProps) => {
  const store = useRootStore()
  const match = useMatch(`/list/${list.id}`)
  const isActive = !!match

  const IconComponent =
    list.type === 'area' ? HexagonIcon : list.type === 'project' ? null : DotIcon

  const areas = store.areas

  const handleSchedule = async (periodType: 'day' | 'week' | 'month', daysOffset: number) => {
    const anchorDate = new Date()
    anchorDate.setDate(anchorDate.getDate() + daysOffset)

    // For week/month scheduling, set to start of period
    if (periodType === 'week') {
      const dayOfWeek = anchorDate.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday is start of week
      anchorDate.setDate(anchorDate.getDate() + diff)
    } else if (periodType === 'month') {
      anchorDate.setDate(1)
    }

    await list.updateScheduledDate(periodType, anchorDate)
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <Link
          to={`/list/${list.id}`}
          className={twMerge(
            clsx(
              'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-gray-700 text-sm hover:bg-neutral-light',
              {
                'ml-6': isNested,
                'bg-neutral-light font-medium text-gray-900': isActive,
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
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-50 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          <ContextMenu.Item
            className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
            onSelect={() => {
              // TODO: Implement rename
              console.log('Rename list:', list.id)
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
                <ContextMenu.Item
                  className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                  onSelect={() => handleSchedule('day', 0)}
                >
                  Today
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                  onSelect={() => handleSchedule('day', 1)}
                >
                  Tomorrow
                </ContextMenu.Item>
                <ContextMenu.Separator className="my-1 h-px bg-gray-200" />
                <ContextMenu.Item
                  className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                  onSelect={() => handleSchedule('week', 0)}
                >
                  This Week
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                  onSelect={() => handleSchedule('week', 7)}
                >
                  Next Week
                </ContextMenu.Item>
                <ContextMenu.Separator className="my-1 h-px bg-gray-200" />
                <ContextMenu.Item
                  className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                  onSelect={() => handleSchedule('month', 0)}
                >
                  This Month
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                  onSelect={() => {
                    const nextMonth = new Date()
                    nextMonth.setMonth(nextMonth.getMonth() + 1)
                    const daysToNextMonth = Math.ceil(
                      (nextMonth.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                    )
                    handleSchedule('month', daysToNextMonth)
                  }}
                >
                  Next Month
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>

          {!list.isArea && (
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
                Set Parent List
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal>
                <ContextMenu.SubContent className="min-w-[180px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                  <ContextMenu.Item
                    className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                    onSelect={() => {
                      store.updateListParent(list.id, null)
                    }}
                  >
                    None
                  </ContextMenu.Item>
                  {areas.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">No areas available</div>
                  ) : (
                    areas.map((area) => (
                      <ContextMenu.Item
                        key={area.id}
                        className="cursor-pointer rounded px-3 py-2 text-gray-700 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                        onSelect={() => {
                          store.updateListParent(list.id, area.id)
                        }}
                      >
                        {area.name}
                      </ContextMenu.Item>
                    ))
                  )}
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
})
