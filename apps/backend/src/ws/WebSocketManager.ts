import type { ServerWebSocket } from 'bun'

export interface WSData {
  userId: string
  clientId: string
  workspaceIds: string[]
}

export class WebSocketManager {
  connections = new Map<string, Set<ServerWebSocket<WSData>>>()

  addConnection(ws: ServerWebSocket<WSData>) {
    for (const workspaceId of ws.data.workspaceIds) {
      let set = this.connections.get(workspaceId)
      if (!set) {
        set = new Set()
        this.connections.set(workspaceId, set)
      }
      set.add(ws)
    }
  }

  removeConnection(ws: ServerWebSocket<WSData>) {
    for (const workspaceId of ws.data.workspaceIds) {
      const set = this.connections.get(workspaceId)
      if (set) {
        set.delete(ws)
        if (set.size === 0) {
          this.connections.delete(workspaceId)
        }
      }
    }
  }

  broadcast(workspaceId: string, message: object, excludeClientId?: string) {
    const set = this.connections.get(workspaceId)
    if (!set) return

    const payload = JSON.stringify(message)
    for (const ws of set) {
      if (excludeClientId && ws.data.clientId === excludeClientId) continue
      ws.send(payload)
    }
  }
}

export const wsManager = new WebSocketManager()
