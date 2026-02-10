import { action, computed, makeObservable, observable } from 'mobx'
import type { BackendTask, PeriodType } from '../api/types'
import type { RootStore } from './RootStore'

export interface ScheduledDate {
  periodType: PeriodType
  anchorDate: Date
}

export class TaskModel {
  id: string
  title: string
  notes: string | null
  workspaceId: string
  listId: string | null
  completed: boolean
  scheduledDate: ScheduledDate | null
  onIce: boolean
  scheduleOrder: string | null
  listOrder: string | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date

  private rootStore: RootStore

  constructor(data: BackendTask, rootStore: RootStore) {
    this.id = String(data.id)
    this.title = data.title
    this.notes = data.notes
    this.workspaceId = data.workspaceId
    this.listId = data.listId ? String(data.listId) : null
    this.completed = data.completed
    this.scheduledDate =
      data.scheduledPeriodType && data.scheduledAnchorDate
        ? {
            periodType: data.scheduledPeriodType,
            anchorDate: new Date(data.scheduledAnchorDate),
          }
        : null
    this.onIce = data.onIce
    this.scheduleOrder = data.scheduleOrder
    this.listOrder = data.listOrder
    this.completedAt = data.completedAt ? new Date(data.completedAt) : null
    this.createdAt = new Date(data.createdAt)
    this.updatedAt = new Date(data.updatedAt)
    this.rootStore = rootStore

    makeObservable(this, {
      title: observable,
      notes: observable,
      workspaceId: observable,
      listId: observable,
      completed: observable,
      scheduledDate: observable,
      onIce: observable,
      scheduleOrder: observable,
      listOrder: observable,
      completedAt: observable,
      updatedAt: observable,
      toggleCompleted: action,
      updateTitle: action,
      updateNotes: action,
      updateScheduledDate: action,
      clearScheduledDate: action,
      setOnIce: action,
      moveToList: action,
      updateScheduleOrder: action,
      updateListOrder: action,
      list: computed,
      areaId: computed,
    })
  }

  get list() {
    if (!this.listId) return null
    return this.rootStore.lists.find((list) => list.id === this.listId) || null
  }

  get areaId(): string | null {
    return this.list?.areaId ?? null
  }

  async toggleCompleted() {
    const newCompleted = !this.completed
    this.completed = newCompleted
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, { completed: newCompleted })
    } catch (err) {
      // Rollback on error
      this.completed = !newCompleted
      throw err
    }
  }

  async updateTitle(newTitle: string) {
    const oldTitle = this.title
    this.title = newTitle
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, { title: newTitle })
    } catch (err) {
      // Rollback on error
      this.title = oldTitle
      throw err
    }
  }

  async updateNotes(newNotes: string | null) {
    const oldNotes = this.notes
    this.notes = newNotes
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, { notes: newNotes || undefined })
    } catch (err) {
      // Rollback on error
      this.notes = oldNotes
      throw err
    }
  }

  async updateScheduledDate(periodType: PeriodType, anchorDate: Date) {
    const oldScheduledDate = this.scheduledDate
    const oldOnIce = this.onIce
    const oldScheduleOrder = this.scheduleOrder

    // Only assign a new scheduleOrder if the task doesn't have one or is moving to a different period type
    const keepExistingOrder =
      this.scheduleOrder !== null && this.scheduledDate?.periodType === periodType
    const newScheduleOrder = keepExistingOrder
      ? this.scheduleOrder
      : this.rootStore.getNextScheduleOrderForPeriod(periodType)

    this.scheduledDate = { periodType, anchorDate }
    this.scheduleOrder = newScheduleOrder
    this.onIce = false // Clear onIce when scheduling
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, {
        scheduledDate: { periodType, anchorDate: anchorDate.toISOString() },
        scheduleOrder: newScheduleOrder ?? undefined,
      })
    } catch (err) {
      // Rollback on error
      this.scheduledDate = oldScheduledDate
      this.scheduleOrder = oldScheduleOrder
      this.onIce = oldOnIce
      throw err
    }
  }

  async clearScheduledDate() {
    const oldScheduledDate = this.scheduledDate
    const oldScheduleOrder = this.scheduleOrder

    this.scheduledDate = null
    this.scheduleOrder = null
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, {
        scheduledDate: null,
        scheduleOrder: null,
      })
    } catch (err) {
      // Rollback on error
      this.scheduledDate = oldScheduledDate
      this.scheduleOrder = oldScheduleOrder
      throw err
    }
  }

  async setOnIce(value: boolean) {
    const oldOnIce = this.onIce
    const oldScheduledDate = this.scheduledDate
    this.onIce = value
    if (value) {
      this.scheduledDate = null // Clear scheduling when putting on ice
    }
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, { onIce: value })
    } catch (err) {
      // Rollback on error
      this.onIce = oldOnIce
      this.scheduledDate = oldScheduledDate
      throw err
    }
  }

  async moveToList(listId: string | null) {
    const oldListId = this.listId
    const oldWorkspaceId = this.workspaceId
    const oldListOrder = this.listOrder

    // Get the target list's workspace if moving to a list
    const targetList = listId ? this.rootStore.getListById(listId) : null
    const newWorkspaceId = targetList?.workspaceId ?? this.workspaceId
    const newListOrder = listId ? this.rootStore.getNextListOrderForList(listId) : null

    this.listId = listId
    this.workspaceId = newWorkspaceId
    this.listOrder = newListOrder
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, {
        listId: listId || null,
        workspaceId: newWorkspaceId,
        listOrder: newListOrder,
      })
    } catch (err) {
      // Rollback on error
      this.listId = oldListId
      this.workspaceId = oldWorkspaceId
      this.listOrder = oldListOrder
      throw err
    }
  }

  async updateScheduleOrder(newScheduleOrder: string) {
    const oldScheduleOrder = this.scheduleOrder
    this.scheduleOrder = newScheduleOrder
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, { scheduleOrder: newScheduleOrder })
    } catch (err) {
      // Rollback on error
      this.scheduleOrder = oldScheduleOrder
      throw err
    }
  }

  async updateListOrder(newListOrder: string) {
    const oldListOrder = this.listOrder
    this.listOrder = newListOrder
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, { listOrder: newListOrder })
    } catch (err) {
      // Rollback on error
      this.listOrder = oldListOrder
      throw err
    }
  }
}
