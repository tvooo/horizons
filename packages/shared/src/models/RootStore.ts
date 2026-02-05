import { isPast } from 'date-fns'
import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import type { APIClient } from '../api/client'
import type {
  BackendScheduledDate,
  BackendWorkspace,
  BackendWorkspaceInvite,
  BackendWorkspaceMember,
  PeriodType,
} from '../api/types'
import { isCurrentPeriod } from '../utils/dateUtils'
import { generateFractionalIndex } from '../utils/fractionalIndexing'
import { WebSocketClient, type WSConnectionStatus } from '../ws/WebSocketClient'
import { ListModel } from './ListModel'
import { TaskModel } from './TaskModel'

export class RootStore {
  workspaces: BackendWorkspace[] = []
  lists: ListModel[] = []
  tasks: TaskModel[] = []
  loading = true
  focusedAreaId: string | null = null

  private api: APIClient
  private wsClient: WebSocketClient | null = null

  constructor(api: APIClient) {
    this.api = api

    makeObservable(this, {
      workspaces: observable,
      lists: observable,
      tasks: observable,
      loading: observable,
      focusedAreaId: observable,
      loadData: action,
      createTask: action,
      createList: action,
      updateTask: action,
      updateList: action,
      updateListParent: action,
      setFocusedArea: action,
      personalWorkspace: computed,
      inboxTasks: computed,
      nowTasks: computed,
      nowLists: computed,
      onIceTasks: computed,
      onIceLists: computed,
      areas: computed,
      projects: computed,
      regularLists: computed,
      focusedArea: computed,
      wsStatus: computed,
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

  connectWebSocket(baseUrl: string) {
    if (this.wsClient) return
    this.wsClient = new WebSocketClient(this, baseUrl)
    this.api.clientId = this.wsClient.clientId
    this.wsClient.connect()
  }

  disconnectWebSocket() {
    this.wsClient?.disconnect()
    this.wsClient = null
    this.api.clientId = ''
  }

  get wsStatus(): WSConnectionStatus {
    return this.wsClient?.status ?? 'disconnected'
  }

  get personalWorkspace(): BackendWorkspace | null {
    return this.workspaces.find((w) => w.type === 'personal') ?? null
  }

  async createTask(title: string, listId?: string, scheduledDate?: BackendScheduledDate) {
    // If creating in a list, use the list's workspace; otherwise use personal workspace
    let workspaceId: string
    if (listId) {
      const list = this.getListById(listId)
      if (!list) {
        throw new Error('List not found')
      }
      workspaceId = list.workspaceId
    } else {
      if (!this.personalWorkspace) {
        throw new Error('No personal workspace found')
      }
      workspaceId = this.personalWorkspace.id
    }

    const scheduleOrder = scheduledDate
      ? this.getNextScheduleOrderForPeriod(scheduledDate.periodType)
      : undefined
    const listOrder = listId ? this.getNextListOrderForList(listId) : undefined

    const backendTask = await this.api.createTask({
      title,
      workspaceId,
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
    workspaceId?: string,
  ) {
    const targetWorkspaceId = workspaceId ?? this.personalWorkspace?.id
    if (!targetWorkspaceId) {
      throw new Error('No personal workspace found')
    }

    const backendList = await this.api.createList({
      name,
      workspaceId: targetWorkspaceId,
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
      scheduledDate?: BackendScheduledDate | null
      listId?: string | null
      onIce?: boolean
      scheduleOrder?: string | null
      listOrder?: string
      workspaceId?: string
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

  getListsByWorkspace(workspaceId: string) {
    return this.lists.filter((list) => list.workspaceId === workspaceId)
  }

  getAreasByWorkspace(workspaceId: string) {
    return this.lists.filter((list) => list.workspaceId === workspaceId && list.isArea)
  }

  getStandaloneListsByWorkspace(workspaceId: string) {
    return this.lists.filter(
      (list) => list.workspaceId === workspaceId && !list.isArea && !list.parentListId,
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

  // Workspace Management
  async createWorkspace(name: string): Promise<BackendWorkspace> {
    const workspace = await this.api.createWorkspace(name)
    runInAction(() => {
      this.workspaces.push(workspace)
    })
    return workspace
  }

  async updateWorkspace(
    id: string,
    updates: { name?: string; color?: string | null },
  ): Promise<BackendWorkspace> {
    const workspace = await this.api.updateWorkspace(id, updates)
    runInAction(() => {
      const index = this.workspaces.findIndex((w) => w.id === id)
      if (index !== -1) {
        this.workspaces[index] = workspace
      }
    })
    return workspace
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.api.deleteWorkspace(id)
    runInAction(() => {
      this.workspaces = this.workspaces.filter((w) => w.id !== id)
    })
  }

  async getWorkspaceMembers(workspaceId: string): Promise<BackendWorkspaceMember[]> {
    return this.api.getWorkspaceMembers(workspaceId)
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    return this.api.removeWorkspaceMember(workspaceId, userId)
  }

  async getWorkspaceInvites(workspaceId: string): Promise<BackendWorkspaceInvite[]> {
    return this.api.getWorkspaceInvites(workspaceId)
  }

  async createWorkspaceInvite(
    workspaceId: string,
    options?: { expiresAt?: string; usageLimit?: number },
  ): Promise<BackendWorkspaceInvite> {
    return this.api.createWorkspaceInvite(workspaceId, options)
  }

  async deleteWorkspaceInvite(workspaceId: string, inviteId: string): Promise<void> {
    return this.api.deleteWorkspaceInvite(workspaceId, inviteId)
  }

  async joinWorkspace(code: string): Promise<BackendWorkspace> {
    const workspace = await this.api.joinWorkspace(code)
    runInAction(() => {
      // Add the workspace if not already in the list
      if (!this.workspaces.find((w) => w.id === workspace.id)) {
        this.workspaces.push(workspace)
      }
    })
    return workspace
  }
}
