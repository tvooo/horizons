import { observer } from 'mobx-react-lite'
import { useParams } from 'react-router-dom'
import { scheduledDateLabel } from 'shared'
import { useRootStore } from '../models/RootStoreContext'
import { ListPage } from '../pages/ListPage'
import { CollapsibleSection } from './CollapsibleSection'
import { ProjectIcon } from './ProjectIcon'
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
  const incompleteTasks = listTasks.filter((task) => !task.completed)
  const completedTasks = listTasks.filter((task) => task.completed)

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

  const icon =
    list.type === 'project' ? (
      <button type="button" className="" onClick={() => list.setArchived(!list.archived)}>
        <ProjectIcon size={28} className="shrink-0" percentage={list.completionPercentage ?? 0} />
      </button>
    ) : undefined

  return (
    <ListPage
      title={list.name}
      onCreateTask={(title) => store.createTask(title, list.id)}
      icon={icon}
      list={list}
      afterInput={
        completedTasks.length > 0 ? (
          <CollapsibleSection
            title="Completed"
            count={completedTasks.length}
            defaultCollapsed={true}
            storageKey={`list-${listId}-completed-collapsed`}
          >
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </CollapsibleSection>
        ) : undefined
      }
    >
      {list.type === 'project' && (
        <div className="mt-4">
          {/* {list.completionPercentage !== undefined && (
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${list.completionPercentage}%` }}
                />
              </div>
              <span className="text-gray-600 text-sm">{list.completionPercentage}%</span>
            </div>
          )} */}
          {list.scheduledDate && (
            <p className="mt-2 text-gray-600 text-sm">{scheduledDateLabel(list.scheduledDate)}</p>
          )}
        </div>
      )}

      {incompleteTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ListPage>
  )
})
