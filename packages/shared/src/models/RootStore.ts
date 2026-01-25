import { isPast } from 'date-fns'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import type { APIClient } from '../api/client'
import type { BackendScheduledDate, BackendWorkspace, PeriodType } from '../api/types'
import { isCurrentPeriod } from '../utils/dateUtils'
import { generateFractionalIndex } from '../utils/fractionalIndexing'
import { ListModel } from './ListModel'
import { TaskModel } from './TaskModel'

export class RootStore {
  workspaces: BackendWorkspace[] = []
  currentWorkspaceId: string | null = null
  lists: ListModel[] = []
  tasks: TaskModel[] = []
  loading = true
  focusedAreaId: string | null = null

  private api: APIClient

  constructor(api: APIClient) {
    this.api = api

    makeObservable(this, {
      workspaces: observable,
      currentWorkspaceId: observable,
      lists: observable,
      tasks: observable,
      loading: observable,
      focusedAreaId: observable,
      loadData: action,
      setCurrentWorkspace: action,
      createTask: action,
      createList: action,
      updateTask: action,
      updateList: action,
      updateListParent: action,
      setFocusedArea: action,
      currentWorkspace: computed,
      inboxTasks: computed,
      nowTasks: computed,
      nowLists: computed,
      onIceTasks: computed,
      onIceLists: computed,
      areas: computed,
      projects: computed,
      regularLists: computed,
      focusedArea: computed,
    })
  }

  async loadData() {
    try {
      const [backendWorkspaces, backendLists, backendTasks] = await Promise.all([
        this.api.getWorkspaces(),
        this.api.getLists(),
        this.api.getTasks(),
      ])

      runInAction(() => {
        this.workspaces = backendWorkspaces
        // Set default workspace to first personal workspace, or first available
        if (!this.currentWorkspaceId && backendWorkspaces.length > 0) {
          const personalWorkspace = backendWorkspaces.find((w) => w.type === 'personal')
          this.currentWorkspaceId = personalWorkspace?.id ?? backendWorkspaces[0].id
        }
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

  get currentWorkspace(): BackendWorkspace | null {
    if (!this.currentWorkspaceId) return null
    return this.workspaces.find((w) => w.id === this.currentWorkspaceId) ?? null
  }

  setCurrentWorkspace(workspaceId: string) {
    this.currentWorkspaceId = workspaceId
  }

  async createTask(title: string, listId?: string, scheduledDate?: BackendScheduledDate) {
    if (!this.currentWorkspaceId) {
      throw new Error('No workspace selected')
    }

    const scheduleOrder = scheduledDate
      ? this.getNextScheduleOrderForPeriod(scheduledDate.periodType)
      : undefined
    const listOrder = listId ? this.getNextListOrderForList(listId) : undefined

    const backendTask = await this.api.createTask({
      title,
      workspaceId: this.currentWorkspaceId,
      listId,
      scheduledDate,
      scheduleOrder,
      listOrder,
    })

    const newTask = new TaskModel(backendTask, this)
    runInAction(() => {
      this.tasks.push(newTask)
    })
    return newTask
  }

  async createList(
    name: string,
    type: 'area' | 'project' | 'list' = 'list',
    parentListId?: string,
  ) {
    if (!this.currentWorkspaceId) {
      throw new Error('No workspace selected')
    }

    const backendList = await this.api.createList({
      name,
      workspaceId: this.currentWorkspaceId,
      type,
      parentListId: parentListId ?? undefined,
    })

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
      notes?: string
      scheduledDate?: BackendScheduledDate
      listId?: string | null
      onIce?: boolean
      scheduleOrder?: string
      listOrder?: string
    },
  ) {
    await this.api.updateTask(taskId, updates)
  }

  async updateList(
    listId: string,
    updates: {
      name?: string
      type?: 'area' | 'project' | 'list'
      parentListId?: string | null
      scheduledDate?: BackendScheduledDate | null
      archived?: boolean
      onIce?: boolean
      notes?: string
    },
  ) {
    await this.api.updateList(listId, updates)
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
      await this.api.updateList(listId, {
        parentListId,
      })
    } catch (err) {
      runInAction(() => {
        list.parentListId = oldParentListId
      })
      throw err
    }
  }

  private isTaskInFocus(task: TaskModel): boolean {
    if (!this.focusedAreaId) return true
    return task.areaId === this.focusedAreaId
  }

  private isListInFocus(list: ListModel): boolean {
    if (!this.focusedAreaId) return true
    return list.areaId === this.focusedAreaId
  }

  get inboxTasks() {
    return this.tasks.filter(
      (task) => !task.listId && !task.completed && !task.onIce && this.isTaskInFocus(task),
    )
  }

  get nowTasks() {
    return this.tasks.filter(
      (task) =>
        !task.completed &&
        task.scheduledDate &&
        (isCurrentPeriod(task.scheduledDate) ||
          (isPast(task.scheduledDate.anchorDate) && !task.completed)) && // FIXME: redunandant completed check, not sure if I always want to hide completed or not
        this.isTaskInFocus(task),
    )
  }

  get nowLists() {
    return this.lists.filter(
      (list) =>
        list.scheduledDate &&
        (isCurrentPeriod(list.scheduledDate) || isPast(list.scheduledDate.anchorDate)) &&
        this.isListInFocus(list),
    )
  }

  get onIceTasks() {
    return this.tasks.filter(
      (task) => task.onIce && !task.listId && !task.completed && this.isTaskInFocus(task),
    )
  }

  get onIceLists() {
    return this.lists.filter((list) => list.onIce && !list.archived && this.isListInFocus(list))
  }

  get areas() {
    return this.lists.filter((list) => list.isArea && this.isListInFocus(list))
  }

  get projects() {
    return this.lists.filter((list) => list.isProject && this.isListInFocus(list))
  }

  get regularLists() {
    return this.lists.filter((list) => list.isList && this.isListInFocus(list))
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
    return this.lists.filter(
      (list) => !list.isArea && !list.parentListId && this.isListInFocus(list),
    )
  }

  get focusedArea() {
    if (!this.focusedAreaId) return null
    return this.getListById(this.focusedAreaId)
  }

  setFocusedArea(areaId: string | null) {
    this.focusedAreaId = areaId
  }

  /**
   * Gets the next scheduleOrder for a task being added to a period.
   * Returns a fractional index that sorts after all existing ordered tasks in that period.
   */
  getNextScheduleOrderForPeriod(periodType: PeriodType): string {
    const tasksWithOrder = this.tasks
      .filter((t) => t.scheduledDate?.periodType === periodType && t.scheduleOrder && !t.completed)
      .map((t) => t.scheduleOrder as string)
      .sort()

    const lastOrder = tasksWithOrder[tasksWithOrder.length - 1] || null
    return generateFractionalIndex(lastOrder, null)
  }

  /**
   * Gets the next listOrder for a task being added to a list.
   * Returns a fractional index that sorts after all existing ordered tasks in that list.
   */
  getNextListOrderForList(listId: string): string {
    const tasksWithOrder = this.tasks
      .filter((t) => t.listId === listId && t.listOrder && !t.completed)
      .map((t) => t.listOrder as string)
      .sort()

    const lastOrder = tasksWithOrder[tasksWithOrder.length - 1] || null
    return generateFractionalIndex(lastOrder, null)
  }

  // Export/Import
  async exportData() {
    return this.api.exportData()
  }

  async importData(data: unknown) {
    return this.api.importData(data)
  }

  // API Tokens
  async getTokens() {
    return this.api.getTokens()
  }

  async createToken(name: string) {
    return this.api.createToken(name)
  }

  async deleteToken(id: string) {
    return this.api.deleteToken(id)
  }
}
