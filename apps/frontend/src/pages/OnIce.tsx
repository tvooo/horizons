import { observer } from 'mobx-react-lite'
import { ListItem } from '../components/ListItem'
import { TaskItem } from '../components/TaskItem'
import { useRootStore } from '../models/RootStoreContext'
import { ListPage } from './ListPage'

export const OnIce = observer(() => {
  const store = useRootStore()
  const onIceTasks = store.onIceTasks
  const onIceLists = store.onIceLists

  return (
    <ListPage title="On Ice" onCreateTask={(title) => store.createTask(title)}>
      {onIceLists.length === 0 && onIceTasks.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p className="text-lg">Nothing on ice</p>
          <p className="mt-2 text-sm">Tasks and projects you've put on hold will appear here.</p>
        </div>
      ) : (
        <>
          {onIceLists.map((list) => (
            <ListItem key={list.id} list={list} />
          ))}
          {onIceTasks.map((task) => (
            <TaskItem key={task.id} task={task} showList />
          ))}
        </>
      )}
    </ListPage>
  )
})
