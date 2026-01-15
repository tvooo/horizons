export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type ListType = 'area' | 'project' | 'list'

export interface BackendScheduledDate {
  periodType: PeriodType
  anchorDate: string
}

// Backend types matching the Drizzle schema
export interface BackendList {
  id: string
  name: string
  type: 'area' | 'project' | 'list'
  parentListId: string | null
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
  id: string
  title: string
  notes: string | null
  listId: string | null
  completed: boolean
  scheduledPeriodType: PeriodType | null
  scheduledAnchorDate: string | null
  onIce: boolean
  scheduleOrder: string | null
  listOrder: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateListRequest {
  name: string
  type?: 'area' | 'project' | 'list'
  parentListId?: string
  scheduledDate?: BackendScheduledDate
  onIce?: boolean
  notes?: string
}

export interface UpdateListRequest {
  name?: string
  type?: 'area' | 'project' | 'list'
  parentListId?: string | null
  archived?: boolean
  scheduledDate?: BackendScheduledDate | null
  onIce?: boolean
  notes?: string
}

export interface CreateTaskRequest {
  title: string
  notes?: string
  listId?: string
  completed?: boolean
  scheduledDate?: BackendScheduledDate
  onIce?: boolean
  scheduleOrder?: string
  listOrder?: string
}

export interface UpdateTaskRequest {
  title?: string
  notes?: string
  listId?: string | null
  completed?: boolean
  scheduledDate?: BackendScheduledDate
  onIce?: boolean
  scheduleOrder?: string
  listOrder?: string
}
