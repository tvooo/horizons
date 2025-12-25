import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'
import { convertBackendList, convertBackendTask, toBackendTaskId } from '../api/converter'
import type { List, Task } from '../types'

interface AppStore {
  lists: List[]
  tasks: Task[]
  loading: boolean
  updateTask: (
    taskId: string,
    updates: { completed?: boolean; title?: string; description?: string },
  ) => Promise<void>
  refreshLists: () => Promise<void>
  refreshTasks: () => Promise<void>
}

const AppStoreContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<List[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const refreshLists = async () => {
    try {
      const backendLists = await api.getLists()
      const convertedLists = backendLists.map(convertBackendList)
      setLists(convertedLists)
    } catch (err) {
      console.error('Failed to fetch lists:', err)
    }
  }

  const refreshTasks = async () => {
    try {
      const backendTasks = await api.getTasks()
      const convertedTasks = backendTasks.map(convertBackendTask)
      setTasks(convertedTasks)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    }
  }

  const updateTask = async (
    taskId: string,
    updates: { completed?: boolean; title?: string; description?: string },
  ) => {
    try {
      const backendTask = await api.updateTask(toBackendTaskId(taskId), updates)
      const updatedTask = convertBackendTask(backendTask)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
    } catch (err) {
      console.error('Failed to update task:', err)
      throw err
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: tja
  useEffect(() => {
    Promise.all([refreshLists(), refreshTasks()]).finally(() => setLoading(false))
  }, [])

  const store: AppStore = {
    lists,
    tasks,
    loading,
    updateTask,
    refreshLists,
    refreshTasks,
  }

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider')
  }
  return context
}
