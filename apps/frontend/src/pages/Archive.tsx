import { format, isThisWeek, isThisYear, isToday, isYesterday } from 'date-fns'
import { observer } from 'mobx-react-lite'
import type { ListModel, TaskModel } from 'shared'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { ListItem } from '../components/ListItem'
import { TaskItem } from '../components/TaskItem'
import { useRootStore } from '../models/RootStoreContext'
import { ListPage } from './ListPage'

type ArchiveItem =
  | { type: 'task'; item: TaskModel; archivedDate: Date | null }
  | { type: 'list'; item: ListModel; archivedDate: Date | null }

function getDateLabel(date: Date): string {
  if (isToday(date)) {
    return 'Today'
  }
  if (isYesterday(date)) {
    return 'Yesterday'
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE') // Day name (e.g., "Monday")
  }
  if (isThisYear(date)) {
    return format(date, 'MMMM d') // Month and day (e.g., "January 15")
  }
  return format(date, 'PPP') // Full date (e.g., "January 15, 2024")
}

function getDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export const Archive = observer(() => {
  const store = useRootStore()

  // Collect all archived items with their archive dates
  const archivedItems: ArchiveItem[] = []
  const itemsWithoutDate: ArchiveItem[] = []

  // Add completed tasks
  for (const task of store.tasks) {
    if (task.completed) {
      const item = {
        type: 'task' as const,
        item: task,
        archivedDate: task.completedAt,
      }
      if (task.completedAt) {
        archivedItems.push(item)
      } else {
        itemsWithoutDate.push(item)
      }
    }
  }

  // Add archived lists
  for (const list of store.lists) {
    if (list.archived) {
      const item = {
        type: 'list' as const,
        item: list,
        archivedDate: list.archivedAt,
      }
      if (list.archivedAt) {
        archivedItems.push(item)
      } else {
        itemsWithoutDate.push(item)
      }
    }
  }

  // Sort by archive date (most recent first)
  // biome-ignore lint/style/noNonNullAssertion: TODO: Need to fix
  archivedItems.sort((a, b) => b.archivedDate!.getTime() - a.archivedDate!.getTime())

  // Group by date
  const groupedByDate: Record<string, ArchiveItem[]> = {}
  const dateLabels: Record<string, string> = {}
  const dateOrder: string[] = []

  for (const item of archivedItems) {
    if (item.archivedDate) {
      const dateKey = getDateKey(item.archivedDate)
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = []
        dateLabels[dateKey] = getDateLabel(item.archivedDate)
        dateOrder.push(dateKey)
      }
      groupedByDate[dateKey].push(item)
    }
  }

  const totalItems = dateOrder.length + (itemsWithoutDate.length > 0 ? 1 : 0)

  return (
    <ListPage title="Archive">
      {totalItems === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          No completed tasks or archived lists yet
        </div>
      ) : (
        <>
          {dateOrder.map((dateKey) => {
            const items = groupedByDate[dateKey]
            const label = dateLabels[dateKey]

            return (
              <CollapsibleSection
                key={dateKey}
                title={label}
                count={items.length}
                defaultCollapsed={false}
                storageKey={`archive-section-${dateKey}`}
              >
                {items.map((item, _index) =>
                  item.type === 'list' ? (
                    <ListItem key={`list-${item.item.id}`} list={item.item} />
                  ) : (
                    <TaskItem key={`task-${item.item.id}`} task={item.item} showList />
                  ),
                )}
              </CollapsibleSection>
            )
          })}
          {itemsWithoutDate.length > 0 && (
            <CollapsibleSection
              key="unknown-date"
              title="Unknown date"
              count={itemsWithoutDate.length}
              defaultCollapsed={false}
              storageKey="archive-section-unknown"
            >
              {itemsWithoutDate.map((item) =>
                item.type === 'list' ? (
                  <ListItem key={`list-${item.item.id}`} list={item.item} />
                ) : (
                  <TaskItem key={`task-${item.item.id}`} task={item.item} showList />
                ),
              )}
            </CollapsibleSection>
          )}
        </>
      )}
    </ListPage>
  )
})
