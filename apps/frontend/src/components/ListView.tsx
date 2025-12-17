import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { lists, tasks } from '../mockData'

export function ListView() {
  const { listId } = useParams<{ listId: string }>()
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    tasks.forEach((task) => {
      initial[task.id] = task.completed
    })
    return initial
  })

  const toggleTask = (taskId: string) => {
    setTaskStates((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const list = lists.find((l) => l.id === listId)
  const listTasks = tasks.filter((task) => task.listId === listId)

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
          {list.description && <p className="mt-2 text-gray-600">{list.description}</p>}
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
              {list.dueDate && (
                <p className="mt-2 text-gray-600 text-sm">
                  Due: {list.dueDate.toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {listTasks.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg">No tasks in this list yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {listTasks.map((task) => (
              <label
                key={task.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={taskStates[task.id]}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span
                    className={`${taskStates[task.id] ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                  >
                    {task.title}
                  </span>
                  {task.description && (
                    <p className="mt-1 text-gray-500 text-sm">{task.description}</p>
                  )}
                  {task.scheduledDate && (
                    <p className="mt-1 text-gray-400 text-xs">
                      Scheduled:{' '}
                      {task.scheduledDate.periodType === 'day'
                        ? task.scheduledDate.anchorDate.toLocaleDateString()
                        : `${task.scheduledDate.periodType} of ${task.scheduledDate.anchorDate.toLocaleDateString()}`}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
