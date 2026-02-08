import type {
  ApiTokenInfo,
  BackendList,
  BackendTask,
  BackendWorkspace,
  BackendWorkspaceInvite,
  BackendWorkspaceMember,
  CreateListRequest,
  CreateTaskRequest,
  CreateTokenResponse,
  UpdateListRequest,
  UpdateTaskRequest,
} from './types'

export class APIClient {
  protected baseUrl: string
  clientId = ''

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  protected doFetch(url: string, init?: RequestInit): Promise<Response> {
    return fetch(url, init)
  }

  private mutationHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.clientId) {
      headers['X-Client-Id'] = this.clientId
    }
    return headers
  }

  // Lists
  async getLists(): Promise<BackendList[]> {
    const response = await this.doFetch(`${this.baseUrl}/api/lists`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch lists')
    return response.json()
  }

  async getList(id: string): Promise<BackendList> {
    const response = await this.doFetch(`${this.baseUrl}/api/lists/${id}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch list')
    return response.json()
  }

  async createList(data: CreateListRequest): Promise<BackendList> {
    const response = await this.doFetch(`${this.baseUrl}/api/lists`, {
      method: 'POST',
      headers: this.mutationHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create list')
    return response.json()
  }

  async updateList(id: string, data: UpdateListRequest): Promise<BackendList> {
    const response = await this.doFetch(`${this.baseUrl}/api/lists/${id}`, {
      method: 'PATCH',
      headers: this.mutationHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update list')
    return response.json()
  }

  // Tasks
  async getTasks(): Promise<BackendTask[]> {
    const response = await this.doFetch(`${this.baseUrl}/api/tasks`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch tasks')
    return response.json()
  }

  async getTask(id: string): Promise<BackendTask> {
    const response = await this.doFetch(`${this.baseUrl}/api/tasks/${id}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch task')
    return response.json()
  }

  async createTask(data: CreateTaskRequest): Promise<BackendTask> {
    const response = await this.doFetch(`${this.baseUrl}/api/tasks`, {
      method: 'POST',
      headers: this.mutationHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create task')
    return response.json()
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<BackendTask> {
    const response = await this.doFetch(`${this.baseUrl}/api/tasks/${id}`, {
      method: 'PATCH',
      headers: this.mutationHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update task')
    return response.json()
  }

  // Export/Import
  async exportData(): Promise<{ blob: Blob; filename: string }> {
    const response = await this.doFetch(`${this.baseUrl}/api/export`, {
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
    const response = await this.doFetch(`${this.baseUrl}/api/import`, {
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

  // API Tokens
  async getTokens(): Promise<ApiTokenInfo[]> {
    const response = await this.doFetch(`${this.baseUrl}/api/tokens`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch tokens')
    return response.json()
  }

  async createToken(name: string): Promise<CreateTokenResponse> {
    const response = await this.doFetch(`${this.baseUrl}/api/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name }),
    })
    if (!response.ok) throw new Error('Failed to create token')
    return response.json()
  }

  async deleteToken(id: string): Promise<void> {
    const response = await this.doFetch(`${this.baseUrl}/api/tokens/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to delete token')
  }

  // Workspaces
  async getWorkspaces(): Promise<BackendWorkspace[]> {
    const response = await this.doFetch(`${this.baseUrl}/api/workspaces`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch workspaces')
    return response.json()
  }

  async createWorkspace(name: string): Promise<BackendWorkspace> {
    const response = await this.doFetch(`${this.baseUrl}/api/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name }),
    })
    if (!response.ok) throw new Error('Failed to create workspace')
    return response.json()
  }

  async updateWorkspace(
    id: string,
    updates: { name?: string; color?: string | null },
  ): Promise<BackendWorkspace> {
    const response = await this.doFetch(`${this.baseUrl}/api/workspaces/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error('Failed to update workspace')
    return response.json()
  }

  async deleteWorkspace(id: string): Promise<void> {
    const response = await this.doFetch(`${this.baseUrl}/api/workspaces/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to delete workspace')
  }

  async getWorkspaceMembers(workspaceId: string): Promise<BackendWorkspaceMember[]> {
    const response = await this.doFetch(`${this.baseUrl}/api/workspaces/${workspaceId}/members`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch workspace members')
    return response.json()
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    const response = await this.doFetch(
      `${this.baseUrl}/api/workspaces/${workspaceId}/members/${userId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    )
    if (!response.ok) throw new Error('Failed to remove workspace member')
  }

  async getWorkspaceInvites(workspaceId: string): Promise<BackendWorkspaceInvite[]> {
    const response = await this.doFetch(`${this.baseUrl}/api/workspaces/${workspaceId}/invites`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Failed to fetch workspace invites')
    return response.json()
  }

  async createWorkspaceInvite(
    workspaceId: string,
    options?: { expiresAt?: string; usageLimit?: number },
  ): Promise<BackendWorkspaceInvite> {
    const response = await this.doFetch(`${this.baseUrl}/api/workspaces/${workspaceId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(options || {}),
    })
    if (!response.ok) throw new Error('Failed to create workspace invite')
    return response.json()
  }

  async deleteWorkspaceInvite(workspaceId: string, inviteId: string): Promise<void> {
    const response = await this.doFetch(
      `${this.baseUrl}/api/workspaces/${workspaceId}/invites/${inviteId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    )
    if (!response.ok) throw new Error('Failed to delete workspace invite')
  }

  async joinWorkspace(code: string): Promise<BackendWorkspace> {
    const response = await this.doFetch(`${this.baseUrl}/api/workspaces/join/${code}`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to join workspace')
    }
    return response.json()
  }
}
