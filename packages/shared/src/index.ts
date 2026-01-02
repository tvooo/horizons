export interface User {
  id: string
  email: string
  name: string
}

export interface ApiResponse<T> {
  data: T
  error?: string
}

// API
export { APIClient } from './api/client'
export * from './api/converter'
export * from './api/types'
// Config
export { calendarConfig } from './config/calendar'
// Models
export { ListModel } from './models/ListModel'
export { RootStore } from './models/RootStore'
export type { ScheduledDate } from './models/TaskModel'
export { TaskModel } from './models/TaskModel'
// Utils
export { isCurrentPeriod, scheduledDateLabel, sortByPeriodTypeAndDate } from './utils/dateUtils'
