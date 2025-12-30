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
  description: string | null
  listId: string | null
  completed: boolean
  scheduledDate: ScheduledDate | null
  createdAt: Date
  updatedAt: Date

  private rootStore: RootStore

  constructor(data: BackendTask, rootStore: RootStore) {
    this.id = String(data.id)
    this.title = data.title
    this.description = data.description
    this.listId = data.listId ? String(data.listId) : null
    this.completed = data.completed
    this.scheduledDate =
      data.scheduledPeriodType && data.scheduledAnchorDate
        ? {
            periodType: data.scheduledPeriodType,
            anchorDate: new Date(data.scheduledAnchorDate),
          }
        : null
    this.createdAt = new Date(data.createdAt)
    this.updatedAt = new Date(data.updatedAt)
    this.rootStore = rootStore

    makeObservable(this, {
      title: observable,
      description: observable,
      listId: observable,
      completed: observable,
      scheduledDate: observable,
      updatedAt: observable,
      toggleCompleted: action,
      updateTitle: action,
      updateDescription: action,
      updateScheduledDate: action,
      moveToList: action,
      list: computed,
    })
  }

  get list() {
    if (!this.listId) return null
    return this.rootStore.lists.find((list) => list.id === this.listId) || null
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

  async updateDescription(newDescription: string | null) {
    const oldDescription = this.description
    this.description = newDescription
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, { description: newDescription || undefined })
    } catch (err) {
      // Rollback on error
      this.description = oldDescription
      throw err
    }
  }

  async updateScheduledDate(periodType: PeriodType, anchorDate: Date) {
    const oldScheduledDate = this.scheduledDate
    this.scheduledDate = { periodType, anchorDate }
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, {
        scheduledDate: { periodType, anchorDate: anchorDate.toISOString() },
      })
    } catch (err) {
      // Rollback on error
      this.scheduledDate = oldScheduledDate
      throw err
    }
  }

  async moveToList(listId: string | null) {
    const oldListId = this.listId
    this.listId = listId
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateTask(this.id, {
        listId: listId ? Number.parseInt(listId, 10) : undefined,
      })
    } catch (err) {
      // Rollback on error
      this.listId = oldListId
      throw err
    }
  }
}
