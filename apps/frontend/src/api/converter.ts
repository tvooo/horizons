import type { Area, List, Project, RegularList, Task } from '../types'
import type { BackendList, BackendTask } from './client'

// Convert backend list to frontend list type
export function convertBackendList(backendList: BackendList): List {
  const base = {
    id: String(backendList.id),
    name: backendList.name,
    createdAt: new Date(backendList.createdAt),
    updatedAt: new Date(backendList.updatedAt),
  }

  if (backendList.type === 'area') {
    return {
      ...base,
      type: 'area' as const,
    } as Area
  }

  if (backendList.type === 'project') {
    return {
      ...base,
      type: 'project' as const,
    } as Project
  }

  // Regular list
  return {
    ...base,
    type: 'regular' as const,
  } as RegularList
}

// Convert backend task to frontend task type
export function convertBackendTask(backendTask: BackendTask): Task {
  const scheduledDate =
    backendTask.scheduledPeriodType && backendTask.scheduledAnchorDate
      ? {
          periodType: backendTask.scheduledPeriodType,
          anchorDate: new Date(backendTask.scheduledAnchorDate),
        }
      : undefined

  return {
    id: String(backendTask.id),
    title: backendTask.title,
    description: backendTask.description || undefined,
    completed: backendTask.completed,
    listId: backendTask.listId ? String(backendTask.listId) : undefined,
    scheduledDate,
    createdAt: new Date(backendTask.createdAt),
    updatedAt: new Date(backendTask.updatedAt),
  }
}

// Convert frontend list ID to backend (string to number)
export function toBackendListId(id: string): number {
  return Number.parseInt(id, 10)
}

// Convert frontend task ID to backend (string to number)
export function toBackendTaskId(id: string): number {
  return Number.parseInt(id, 10)
}
