import { observer } from 'mobx-react-lite'
import { ListItem } from '../components/ListItem'
import { TaskItem } from '../components/TaskItem'
import { useRootStore } from '../models/RootStore'
import { sortByPeriodTypeAndDate } from '../utils/dateUtils'
import { ListPage } from './ListPage'

export const Now = observer(() => {
  const store = useRootStore()
  const nowTasks = store.nowTasks.slice().sort(sortByPeriodTypeAndDate)
  const nowLists = store.nowLists.slice().sort(sortByPeriodTypeAndDate)

  return (
    <ListPage title="Now" onCreateTask={(title) => store.createTask(title)}>
      {nowLists.map((list) => (
        <ListItem key={list.id} list={list} />
      ))}
      {nowTasks.map((task) => (
        <TaskItem key={task.id} task={task} showList />
      ))}
    </ListPage>
  )
})
