import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import type { BackendList, PeriodType } from '../api/client'
import type { RootStore } from './RootStore'

export class ListModel {
  id: string
  name: string
  type: 'area' | 'project' | 'list'
  parentListId: string | null
  archived: boolean
  scheduledDate: { periodType: PeriodType; anchorDate: Date } | null
  createdAt: Date
  updatedAt: Date

  private rootStore: RootStore

  constructor(data: BackendList, rootStore: RootStore) {
    this.id = String(data.id)
    this.name = data.name
    this.type = data.type === 'list' ? 'list' : data.type
    this.parentListId = data.parentListId ? String(data.parentListId) : null
    this.archived = data.archived
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
      name: observable,
      type: observable,
      parentListId: observable,
      archived: observable,
      scheduledDate: observable,
      updatedAt: observable,
      updateScheduledDate: action,
      setArchived: action,
      numberOfOpenTasks: computed,
      numberOfTasks: computed,
    })
  }

  get isArea(): boolean {
    return this.type === 'area'
  }

  get isProject(): boolean {
    return this.type === 'project'
  }

  get isList(): boolean {
    return this.type === 'list'
  }

  get isArchived(): boolean {
    return this.archived
  }

  get numberOfTasks(): number {
    return this.rootStore.tasks.filter((task) => this.id === task.listId).length
  }

  get numberOfOpenTasks(): number {
    return this.rootStore.tasks.filter((task) => this.id === task.listId && !task.completed).length
  }

  get completionPercentage(): number | undefined {
    const total = this.numberOfTasks
    if (total === 0) {
      return 0
    }
    const open = this.numberOfOpenTasks
    return Math.round(((total - open) / total) * 100)
  }

  async updateScheduledDate(periodType: PeriodType, anchorDate: Date) {
    const oldScheduledDate = this.scheduledDate
    this.scheduledDate = { periodType, anchorDate }
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateList(this.id, {
        scheduledDate: { periodType, anchorDate: anchorDate.toISOString() },
      })
    } catch (err) {
      runInAction(() => {
        this.scheduledDate = oldScheduledDate
      })
      throw err
    }
  }

  async setArchived(archived: boolean) {
    const oldArchived = this.archived
    this.archived = archived
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateList(this.id, { archived })
    } catch (err) {
      runInAction(() => {
        this.archived = oldArchived
      })
      throw err
    }
  }
}
