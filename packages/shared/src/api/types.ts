export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type ListType = 'area' | 'project' | 'list'

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
  archived: boolean
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
  archived?: boolean
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
  listId?: number | null
  completed?: boolean
  scheduledDate?: BackendScheduledDate
}
