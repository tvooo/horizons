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

  async getList(id: string): Promise<BackendList> {
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

  async updateList(id: string, data: UpdateListRequest): Promise<BackendList> {
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

  async getTask(id: string): Promise<BackendTask> {
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

  async updateTask(id: string, data: UpdateTaskRequest): Promise<BackendTask> {
    const response = await fetch(`${this.baseUrl}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update task')
    return response.json()
  }

  // Export/Import
  async exportData(): Promise<{ blob: Blob; filename: string }> {
    const response = await fetch(`${this.baseUrl}/api/export`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to export data')

    // Get the filename from Content-Disposition header or use a default
    const contentDisposition = response.headers.get('Content-Disposition')
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
    const filename = filenameMatch
      ? filenameMatch[1]
      : `horizons-export-${new Date().toISOString().split('T')[0]}.json`

    const blob = await response.blob()
    return { blob, filename }
  }

  async importData(
    data: unknown,
  ): Promise<{ success: boolean; imported: { lists: number; tasks: number }; conflicts: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to import data')
    }
    return response.json()
  }
}
