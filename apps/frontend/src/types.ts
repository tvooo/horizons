// Period types for scheduled dates
export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year'

// Scheduled date using period and anchor date
// For a specific date, use periodType: 'day' with the anchor date
export interface ScheduledDate {
  periodType: PeriodType
  anchorDate: Date
}

// List type discriminator
export type ListType = 'list' | 'project' | 'area'

// Base list interface with common properties
interface BaseList {
  id: string
  name: string
  description?: string
  scheduledDate?: ScheduledDate // Lists can be scheduled to focus on them during a period
  createdAt: Date
  updatedAt: Date
}

// Regular list - can belong to an area
export interface RegularList extends BaseList {
  type: 'regular'
  areaId?: string
}

// Project - has completion tracking and due date, can belong to an area
export interface Project extends BaseList {
  type: 'project'
  completionPercentage?: number
  dueDate?: Date
  areaId?: string
}

// Area - other lists and projects can belong to it, but no nesting
export interface Area extends BaseList {
  type: 'area'
  // Areas cannot belong to other areas
}

// Union type for all list types
export type List = RegularList | Project | Area

// Task - can be part of a list or standalone
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  completedAt?: Date
  listId?: string // Optional - tasks don't have to be part of a list
  scheduledDate?: ScheduledDate
  createdAt: Date
  updatedAt: Date
}

// Type guards for list types
export function isRegularList(list: List): list is RegularList {
  return list.type === 'regular'
}

export function isProject(list: List): list is Project {
  return list.type === 'project'
}

export function isArea(list: List): list is Area {
  return list.type === 'area'
}

// Helper to check if a list can belong to an area
export function canBelongToArea(list: List): list is RegularList | Project {
  return list.type === 'regular' || list.type === 'project'
}
