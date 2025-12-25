const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface BackendScheduledDate {
  periodType: PeriodType
  anchorDate: string
}

// Backend types matching the Drizzle schema
export interface BackendList {
  id: number
  name: string
  type: 'area' | 'project' | 'list'
  parentListId: number | null
  scheduledPeriodType: PeriodType | null
  scheduledAnchorDate: string | null
  createdAt: string
  updatedAt: string
}

export interface BackendTask {
  id: number
  title: string
  description: string | null
  listId: number | null
  completed: boolean
  scheduledPeriodType: PeriodType | null
  scheduledAnchorDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateListRequest {
  name: string
  type?: 'area' | 'project' | 'list'
  parentListId?: number
  scheduledDate?: BackendScheduledDate
}

export interface UpdateListRequest {
  name?: string
  type?: 'area' | 'project' | 'list'
  parentListId?: number | null
  scheduledDate?: BackendScheduledDate | null
}

export interface CreateTaskRequest {
  title: string
  description?: string
  listId?: number
  completed?: boolean
  scheduledDate?: BackendScheduledDate
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  listId?: number
  completed?: boolean
  scheduledDate?: BackendScheduledDate
}

class APIClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // Lists
  async getLists(): Promise<BackendList[]> {
    const response = await fetch(`${this.baseUrl}/api/lists`)
    if (!response.ok) throw new Error('Failed to fetch lists')
    return response.json()
  }

  async getList(id: number): Promise<BackendList> {
    const response = await fetch(`${this.baseUrl}/api/lists/${id}`)
    if (!response.ok) throw new Error('Failed to fetch list')
    return response.json()
  }

  async createList(data: CreateListRequest): Promise<BackendList> {
    const response = await fetch(`${this.baseUrl}/api/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create list')
    return response.json()
  }

  async updateList(id: number, data: UpdateListRequest): Promise<BackendList> {
    const response = await fetch(`${this.baseUrl}/api/lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update list')
    return response.json()
  }

  // Tasks
  async getTasks(): Promise<BackendTask[]> {
    const response = await fetch(`${this.baseUrl}/api/tasks`)
    if (!response.ok) throw new Error('Failed to fetch tasks')
    return response.json()
  }

  async getTask(id: number): Promise<BackendTask> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${id}`)
    if (!response.ok) throw new Error('Failed to fetch task')
    return response.json()
  }

  async createTask(data: CreateTaskRequest): Promise<BackendTask> {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create task')
    return response.json()
  }

  async updateTask(id: number, data: UpdateTaskRequest): Promise<BackendTask> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update task')
    return response.json()
  }
}

export const api = new APIClient(API_BASE_URL)
