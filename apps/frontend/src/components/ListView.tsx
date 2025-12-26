import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import { useRootStore } from '../models/RootStore'
import { scheduledDateLabel } from '../utils/dateUtils'
import { NewTaskInput } from './NewTaskInput'
import { TaskItem } from './TaskItem'

export const ListView = observer(() => {
  const { listId } = useParams<{ listId: string }>()
  const store = useRootStore()

  if (!listId) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 font-bold text-3xl text-red-600">Invalid list</h1>
        </div>
      </div>
    )
  }

  const list = store.getListById(listId)
  const listTasks = store.getTasksByListId(listId)

  if (!list) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 font-bold text-3xl text-red-600">List not found</h1>
          <p className="text-gray-600">The list you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="font-bold text-3xl">{list.name}</h1>
          {/* {list.description && <p className="mt-2 text-gray-600">{list.description}</p>} */}
          {list.type === 'project' && (
            <div className="mt-4">
              {list.completionPercentage !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{ width: `${list.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-gray-600 text-sm">{list.completionPercentage}%</span>
                </div>
              )}
              {list.scheduledDate && (
                <p className="mt-2 text-gray-600 text-sm">
                  {scheduledDateLabel(list.scheduledDate)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {listTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}

          <NewTaskInput onCreateTask={(title) => store.createTask(title, listId)} />
        </div>
      </div>
    </div>
  )
})
