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
  onIce: boolean
  notes: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BackendTask {
  id: number
  title: string
  notes: string | null
  listId: number | null
  completed: boolean
  scheduledPeriodType: PeriodType | null
  scheduledAnchorDate: string | null
  onIce: boolean
  scheduleOrder: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateListRequest {
  name: string
  type?: 'area' | 'project' | 'list'
  parentListId?: number
  scheduledDate?: BackendScheduledDate
  onIce?: boolean
  notes?: string
}

export interface UpdateListRequest {
  name?: string
  type?: 'area' | 'project' | 'list'
  parentListId?: number | null
  archived?: boolean
  scheduledDate?: BackendScheduledDate | null
  onIce?: boolean
  notes?: string
}

export interface CreateTaskRequest {
  title: string
  notes?: string
  listId?: number
  completed?: boolean
  scheduledDate?: BackendScheduledDate
  onIce?: boolean
  scheduleOrder?: string
}

export interface UpdateTaskRequest {
  title?: string
  notes?: string
  listId?: number | null
  completed?: boolean
  scheduledDate?: BackendScheduledDate
  onIce?: boolean
  scheduleOrder?: string
}
