import { useState } from 'react'
import { tasks } from '../mockData'

export function Inbox() {
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

  // Get inbox tasks: no list AND no scheduled date
  const inboxTasks = tasks.filter((task) => !task.listId && !task.scheduledDate)

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 font-bold text-3xl">Inbox</h1>

        {inboxTasks.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg">Your inbox is empty!</p>
            <p className="mt-2 text-sm">All tasks are organized or scheduled.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inboxTasks.map((task) => (
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
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
