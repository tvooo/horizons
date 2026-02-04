import { makeObservable, observable, runInAction } from 'mobx'
import type { BackendList, BackendTask } from '../api/types'
import type { WSMessage } from '../api/wsTypes'
import { ListModel } from '../models/ListModel'
import type { RootStore } from '../models/RootStore'
import { TaskModel } from '../models/TaskModel'

export type WSConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export class WebSocketClient {
  readonly clientId: string
  status: WSConnectionStatus = 'disconnected'
  private ws: WebSocket | null = null
  private store: RootStore
  private baseUrl: string
  private reconnectDelay = 1000
  private maxReconnectDelay = 30000
  private shouldReconnect = true

  constructor(store: RootStore, baseUrl: string) {
    this.store = store
    this.baseUrl = baseUrl
    this.clientId = crypto.randomUUID()
    makeObservable(this, { status: observable })
  }

  connect() {
    this.shouldReconnect = true
    runInAction(() => {
      this.status = 'connecting'
    })
    const protocol = this.baseUrl.startsWith('https') ? 'wss' : 'ws'
    const host = this.baseUrl.replace(/^https?:\/\//, '')
    const url = `${protocol}://${host}/api/ws?clientId=${this.clientId}`

    this.ws = new WebSocket(url)

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch {
        // Ignore malformed messages
      }
    }

    this.ws.onopen = () => {
      this.reconnectDelay = 1000
      runInAction(() => {
        this.status = 'connected'
      })
    }

    this.ws.onclose = () => {
      runInAction(() => {
        this.status = 'disconnected'
      })
      if (this.shouldReconnect) {
        setTimeout(() => this.connect(), this.reconnectDelay)
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay)
      }
    }
  }

  disconnect() {
    this.shouldReconnect = false
    this.ws?.close()
    this.ws = null
    runInAction(() => {
      this.status = 'disconnected'
    })
  }

  handleMessage(message: WSMessage) {
    switch (message.type) {
      case 'task:created':
        this.handleTaskCreated(message.data as BackendTask)
        break
      case 'task:updated':
        this.handleTaskUpdated(message.data as BackendTask)
        break
      case 'list:created':
        this.handleListCreated(message.data as BackendList)
        break
      case 'list:updated':
        this.handleListUpdated(message.data as BackendList)
        break
    }
  }

  private handleTaskCreated(data: BackendTask) {
    runInAction(() => {
      if (this.store.tasks.some((t) => t.id === data.id)) return
      this.store.tasks.push(new TaskModel(data, this.store))
    })
  }

  private handleTaskUpdated(data: BackendTask) {
    runInAction(() => {
      const task = this.store.tasks.find((t) => t.id === data.id)
      if (!task) return
      task.title = data.title
      task.notes = data.notes
      task.workspaceId = data.workspaceId
      task.listId = data.listId ? String(data.listId) : null
      task.completed = data.completed
      task.scheduledDate =
        data.scheduledPeriodType && data.scheduledAnchorDate
          ? {
              periodType: data.scheduledPeriodType,
              anchorDate: new Date(data.scheduledAnchorDate),
            }
          : null
      task.onIce = data.onIce
      task.scheduleOrder = data.scheduleOrder
      task.listOrder = data.listOrder
      task.completedAt = data.completedAt ? new Date(data.completedAt) : null
      task.updatedAt = new Date(data.updatedAt)
    })
  }

  private handleListCreated(data: BackendList) {
    runInAction(() => {
      if (this.store.lists.some((l) => l.id === data.id)) return
      this.store.lists.push(new ListModel(data, this.store))
    })
  }

  private handleListUpdated(data: BackendList) {
    runInAction(() => {
      const list = this.store.lists.find((l) => l.id === data.id)
      if (!list) return
      list.name = data.name
      list.type = data.type === 'list' ? 'list' : data.type
      list.workspaceId = data.workspaceId
      list.parentListId = data.parentListId ? String(data.parentListId) : null
      list.archived = data.archived
      list.scheduledDate =
        data.scheduledPeriodType && data.scheduledAnchorDate
          ? {
              periodType: data.scheduledPeriodType,
              anchorDate: new Date(data.scheduledAnchorDate),
            }
          : null
      list.onIce = data.onIce
      list.notes = data.notes
      list.archivedAt = data.archivedAt ? new Date(data.archivedAt) : null
      list.updatedAt = new Date(data.updatedAt)
    })
  }
}
