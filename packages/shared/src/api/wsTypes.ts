import type { BackendList, BackendTask } from './types'

export type WSEventType = 'task:created' | 'task:updated' | 'list:created' | 'list:updated'

export interface WSMessage {
  type: WSEventType
  data: BackendTask | BackendList
  clientId: string
}
