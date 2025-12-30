import type {
  BackendList,
  BackendTask,
  CreateListRequest,
  CreateTaskRequest,
  UpdateListRequest,
  UpdateTaskRequest,
} from './types'

export class APIClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // Lists
  async getLists(): Promise<BackendList[]> {
    const response = await fetch(`${this.baseUrl}/api/lists`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch lists')
    return response.json()
  }

  async getList(id: number): Promise<BackendList> {
    const response = await fetch(`${this.baseUrl}/api/lists/${id}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch list')
    return response.json()
  }

  async createList(data: CreateListRequest): Promise<BackendList> {
    const response = await fetch(`${this.baseUrl}/api/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create list')
    return response.json()
  }

  async updateList(id: number, data: UpdateListRequest): Promise<BackendList> {
    const response = await fetch(`${this.baseUrl}/api/lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update list')
    return response.json()
  }

  // Tasks
  async getTasks(): Promise<BackendTask[]> {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch tasks')
    return response.json()
  }

  async getTask(id: number): Promise<BackendTask> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch task')
    return response.json()
  }

  async createTask(data: CreateTaskRequest): Promise<BackendTask> {
    const response = await fetch(`${this.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create task')
    return response.json()
  }

  async updateTask(id: number, data: UpdateTaskRequest): Promise<BackendTask> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update task')
    return response.json()
  }
}
