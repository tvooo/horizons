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
export * from './api/types'
export * from './api/wsTypes'
// Config
export { calendarConfig } from './config/calendar'
// Models
export { ListModel } from './models/ListModel'
export { RootStore } from './models/RootStore'
export type { ScheduledDate } from './models/TaskModel'
export { TaskModel } from './models/TaskModel'
// Utils
export { isCurrentPeriod, scheduledDateLabel, sortByPeriodTypeAndDate } from './utils/dateUtils'
export {
  compareFractionalIndices,
  generateFractionalIndex,
  isValidFractionalIndex,
} from './utils/fractionalIndexing'
// WebSocket
export type { WSConnectionStatus } from './ws/WebSocketClient'
export { WebSocketClient } from './ws/WebSocketClient'
