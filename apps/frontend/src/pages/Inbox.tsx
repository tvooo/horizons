import { observer } from 'mobx-react-lite'
import { TaskItem } from '../components/TaskItem'
import { useRootStore } from '../models/RootStore'
import { ListPage } from './ListPage'

export const Inbox = observer(() => {
  const store = useRootStore()
  const inboxTasks = store.inboxTasks

  return (
    <ListPage title="Inbox" onCreateTask={(title) => store.createTask(title)}>
      {inboxTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ListPage>
  )
})
