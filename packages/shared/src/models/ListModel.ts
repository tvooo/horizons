import { action, computed, makeObservable, observable, runInAction } from 'mobx'
import type { BackendList, PeriodType } from '../api/types'
import type { RootStore } from './RootStore'

export class ListModel {
  id: string
  name: string
  type: 'area' | 'project' | 'list'
  workspaceId: string
  parentListId: string | null
  archived: boolean
  scheduledDate: { periodType: PeriodType; anchorDate: Date } | null
  onIce: boolean
  notes: string | null
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date

  private rootStore: RootStore

  constructor(data: BackendList, rootStore: RootStore) {
    this.id = String(data.id)
    this.name = data.name
    this.type = data.type === 'list' ? 'list' : data.type
    this.workspaceId = data.workspaceId
    this.parentListId = data.parentListId ? String(data.parentListId) : null
    this.archived = data.archived
    this.scheduledDate =
      data.scheduledPeriodType && data.scheduledAnchorDate
        ? {
            periodType: data.scheduledPeriodType,
            anchorDate: new Date(data.scheduledAnchorDate),
          }
        : null
    this.onIce = data.onIce
    this.notes = data.notes
    this.archivedAt = data.archivedAt ? new Date(data.archivedAt) : null
    this.createdAt = new Date(data.createdAt)
    this.updatedAt = new Date(data.updatedAt)
    this.rootStore = rootStore

    makeObservable(this, {
      name: observable,
      type: observable,
      parentListId: observable,
      archived: observable,
      scheduledDate: observable,
      onIce: observable,
      notes: observable,
      archivedAt: observable,
      updatedAt: observable,
      updateName: action,
      updateScheduledDate: action,
      setArchived: action,
      setOnIce: action,
      updateNotes: action,
      numberOfOpenTasks: computed,
      numberOfTasks: computed,
      areaId: computed,
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

  get areaId(): string | null {
    // If this is an area, return its own id
    if (this.isArea) {
      return this.id
    }

    // If this has a parent, return the parent's areaId (recursive)
    if (this.parentListId) {
      const parent = this.rootStore.getListById(this.parentListId)
      return parent?.areaId ?? null
    }

    // Otherwise, no area
    return null
  }

  async updateName(newName: string) {
    const oldName = this.name
    this.name = newName
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateList(this.id, { name: newName })
    } catch (err) {
      runInAction(() => {
        this.name = oldName
      })
      throw err
    }
  }

  async updateScheduledDate(periodType: PeriodType, anchorDate: Date) {
    const oldScheduledDate = this.scheduledDate
    const oldOnIce = this.onIce
    this.scheduledDate = { periodType, anchorDate }
    this.onIce = false // Clear onIce when scheduling
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateList(this.id, {
        scheduledDate: { periodType, anchorDate: anchorDate.toISOString() },
      })
    } catch (err) {
      runInAction(() => {
        this.scheduledDate = oldScheduledDate
        this.onIce = oldOnIce
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

  async setOnIce(value: boolean) {
    const oldOnIce = this.onIce
    const oldScheduledDate = this.scheduledDate
    this.onIce = value
    if (value) {
      this.scheduledDate = null // Clear scheduling when putting on ice
    }
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateList(this.id, { onIce: value })
    } catch (err) {
      runInAction(() => {
        this.onIce = oldOnIce
        this.scheduledDate = oldScheduledDate
      })
      throw err
    }
  }

  async updateNotes(newNotes: string | null) {
    const oldNotes = this.notes
    this.notes = newNotes
    this.updatedAt = new Date()

    try {
      await this.rootStore.updateList(this.id, { notes: newNotes || undefined })
    } catch (err) {
      runInAction(() => {
        this.notes = oldNotes
      })
      throw err
    }
  }
}
