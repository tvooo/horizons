import { observer } from 'mobx-react-lite'
import { NewTaskInput } from '../components/NewTaskInput'
import { TaskItem } from '../components/TaskItem'
import { useRootStore } from '../models/RootStore'

export const Inbox = observer(() => {
  const store = useRootStore()
  const inboxTasks = store.inboxTasks

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-bold text-3xl">Inbox</h1>

        <div className="space-y-2">
          {inboxTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}

          <NewTaskInput onCreateTask={(title) => store.createTask(title)} />
        </div>
      </div>
    </div>
  )
})
