import { isPast } from 'date-fns'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import { createContext, useContext } from 'react'
import { api, type BackendScheduledDate } from '../api/client'
import { toBackendTaskId } from '../api/converter'
import { isCurrentPeriod } from '../utils/dateUtils'
import { ListModel } from './ListModel'
import { TaskModel } from './TaskModel'

export class RootStore {
  lists: ListModel[] = []
  tasks: TaskModel[] = []
  loading = true

  constructor() {
    makeObservable(this, {
      lists: observable,
      tasks: observable,
      loading: observable,
      loadData: action,
      createTask: action,
      createList: action,
      updateTask: action,
      updateList: action,
      updateListParent: action,
      inboxTasks: computed,
      nowTasks: computed,
      nowLists: computed,
      areas: computed,
      projects: computed,
      regularLists: computed,
    })
  }

  async loadData() {
    try {
      const [backendLists, backendTasks] = await Promise.all([api.getLists(), api.getTasks()])

      runInAction(() => {
        this.lists = backendLists.map((data) => new ListModel(data, this))
        this.tasks = backendTasks.map((data) => new TaskModel(data, this))
        this.loading = false
      })
    } catch (err) {
      console.error('Failed to load data:', err)
      runInAction(() => {
        this.loading = false
      })
    }
  }

  async createTask(title: string, listId?: string) {
    const backendTask = await api.createTask({
      title,
      listId: listId ? Number.parseInt(listId, 10) : undefined,
    })

    const newTask = new TaskModel(backendTask, this)
    runInAction(() => {
      this.tasks.push(newTask)
    })
    return newTask
  }

  async createList(name: string, type: 'area' | 'project' | 'list' = 'list') {
    const backendList = await api.createList({ name, type })

    const newList = new ListModel(backendList, this)
    runInAction(() => {
      this.lists.push(newList)
    })
    return newList
  }

  async updateTask(
    taskId: string,
    updates: {
      completed?: boolean
      title?: string
      description?: string
      scheduledDate?: BackendScheduledDate
      listId?: number | null
    },
  ) {
    await api.updateTask(toBackendTaskId(taskId), updates)
  }

  async updateList(
    listId: string,
    updates: {
      name?: string
      type?: 'area' | 'project' | 'list'
      parentListId?: number | null
      scheduledDate?: BackendScheduledDate | null
      archived?: boolean
    },
  ) {
    await api.updateList(Number.parseInt(listId, 10), updates)
  }

  async updateListParent(listId: string, parentListId: string | null) {
    const list = this.getListById(listId)
    if (!list) return

    const oldParentListId = list.parentListId

    runInAction(() => {
      list.parentListId = parentListId
      list.updatedAt = new Date()
    })

    try {
      await api.updateList(Number.parseInt(listId, 10), {
        parentListId: parentListId ? Number.parseInt(parentListId, 10) : null,
      })
    } catch (err) {
      runInAction(() => {
        list.parentListId = oldParentListId
      })
      throw err
    }
  }

  get inboxTasks() {
    return this.tasks.filter((task) => !task.listId && !task.completed)
  }

  get nowTasks() {
    return this.tasks.filter(
      (task) =>
        !task.completed &&
        task.scheduledDate &&
        (isCurrentPeriod(task.scheduledDate) ||
          (isPast(task.scheduledDate.anchorDate) && !task.completed)), // FIXME: redunandant completed check, not sure if I always want to hide completed or not
    )
  }

  get nowLists() {
    return this.lists.filter(
      (list) =>
        list.scheduledDate &&
        (isCurrentPeriod(list.scheduledDate) || isPast(list.scheduledDate.anchorDate)),
    )
  }

  get areas() {
    return this.lists.filter((list) => list.isArea)
  }

  get projects() {
    return this.lists.filter((list) => list.isProject)
  }

  get regularLists() {
    return this.lists.filter((list) => list.isList)
  }

  getTasksByListId(listId: string) {
    return this.tasks.filter((task) => task.listId === listId)
  }

  getListById(listId: string) {
    return this.lists.find((list) => list.id === listId)
  }

  getChildLists(parentListId: string) {
    return this.lists.filter((list) => list.parentListId === parentListId)
  }

  getStandaloneLists() {
    return this.lists.filter((list) => !list.isArea && !list.parentListId)
  }
}

const RootStoreContext = createContext<RootStore | null>(null)

export const RootStoreProvider = RootStoreContext.Provider

export function useRootStore() {
  const context = useContext(RootStoreContext)
  if (!context) {
    throw new Error('useRootStore must be used within RootStoreProvider')
  }
  return context
}
