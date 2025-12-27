import { observer } from 'mobx-react-lite'
import { ListItem } from '../components/ListItem'
import { NewTaskInput } from '../components/NewTaskInput'
import { TaskItem } from '../components/TaskItem'
import { useRootStore } from '../models/RootStore'

export const Now = observer(() => {
  const store = useRootStore()
  const nowTasks = store.nowTasks
  const nowLists = store.nowLists

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-bold text-3xl">Now</h1>

        <div className="space-y-2">
          {nowLists.map((list) => (
            <ListItem key={list.id} list={list} />
          ))}
          {nowTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}

          <NewTaskInput onCreateTask={(title) => store.createTask(title)} />
        </div>
      </div>
    </div>
  )
})
