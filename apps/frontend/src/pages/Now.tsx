import { observer } from 'mobx-react-lite'
import type { ListModel, PeriodType, TaskModel } from 'shared'
import { sortByPeriodTypeAndDate } from 'shared'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { ListItem } from '../components/ListItem'
import { TaskItem } from '../components/TaskItem'
import { useRootStore } from '../models/RootStoreContext'
import { ListPage } from './ListPage'

const PERIOD_LABELS: Record<PeriodType, string> = {
  day: 'Today',
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
}

const PERIOD_ORDER: PeriodType[] = ['day', 'week', 'month', 'quarter', 'year']

export const Now = observer(() => {
  const store = useRootStore()
  const nowTasks = store.nowTasks.slice().sort(sortByPeriodTypeAndDate)
  const nowLists = store.nowLists.filter((list) => !list.archived).sort(sortByPeriodTypeAndDate)

  // Group tasks and lists by period type
  const groupedByPeriod: Record<PeriodType, { tasks: TaskModel[]; lists: ListModel[] }> = {
    day: { tasks: [], lists: [] },
    week: { tasks: [], lists: [] },
    month: { tasks: [], lists: [] },
    quarter: { tasks: [], lists: [] },
    year: { tasks: [], lists: [] },
  }

  for (const task of nowTasks) {
    if (task.scheduledDate) {
      groupedByPeriod[task.scheduledDate.periodType].tasks.push(task)
    }
  }

  for (const list of nowLists) {
    if (list.scheduledDate) {
      groupedByPeriod[list.scheduledDate.periodType].lists.push(list)
    }
  }

  return (
    <ListPage title="Now" onCreateTask={(title) => store.createTask(title)}>
      {PERIOD_ORDER.map((periodType) => {
        const { tasks, lists } = groupedByPeriod[periodType]
        const totalCount = tasks.length + lists.length

        if (totalCount === 0) return null

        return (
          <CollapsibleSection
            key={periodType}
            title={PERIOD_LABELS[periodType]}
            count={totalCount}
            defaultCollapsed={periodType !== 'day' && periodType !== 'week'}
            storageKey={`now-section-${periodType}`}
          >
            {lists.map((list) => (
              <ListItem key={list.id} list={list} />
            ))}
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} showList />
            ))}
          </CollapsibleSection>
        )
      })}
    </ListPage>
  )
})
