import { describe, expect, test } from 'bun:test'
import type { ServerWebSocket } from 'bun'
import { WebSocketManager, type WSData } from './WebSocketManager'

function createMockWS(data: WSData): ServerWebSocket<WSData> & { sentMessages: string[] } {
  const sentMessages: string[] = []
  return {
    data,
    sentMessages,
    send(msg: string) {
      sentMessages.push(msg)
      return 0
    },
    readyState: 1,
    close() {},
    subscribe() {},
    unsubscribe() {},
    publish() {},
    isSubscribed() {
      return false
    },
    cork() {},
    ping() {},
    pong() {},
    remoteAddress: '127.0.0.1',
    binaryType: 'arraybuffer',
  } as unknown as ServerWebSocket<WSData> & { sentMessages: string[] }
}

describe('WebSocketManager', () => {
  test('addConnection registers socket under each workspaceId', () => {
    const manager = new WebSocketManager()
    const ws = createMockWS({ userId: 'u1', clientId: 'c1', workspaceIds: ['w1', 'w2'] })

    manager.addConnection(ws)

    expect(manager.connections.get('w1')?.has(ws)).toBe(true)
    expect(manager.connections.get('w2')?.has(ws)).toBe(true)
  })

  test('broadcast sends to all sockets in workspace except sender', () => {
    const manager = new WebSocketManager()
    const ws1 = createMockWS({ userId: 'u1', clientId: 'c1', workspaceIds: ['w1'] })
    const ws2 = createMockWS({ userId: 'u2', clientId: 'c2', workspaceIds: ['w1'] })

    manager.addConnection(ws1)
    manager.addConnection(ws2)

    const message = { type: 'task:created', data: { id: 't1' }, clientId: 'c1' }
    manager.broadcast('w1', message, 'c1')

    expect(ws1.sentMessages).toHaveLength(0)
    expect(ws2.sentMessages).toHaveLength(1)
    expect(JSON.parse(ws2.sentMessages[0])).toEqual(message)
  })

  test('broadcast does not leak to other workspaces', () => {
    const manager = new WebSocketManager()
    const ws1 = createMockWS({ userId: 'u1', clientId: 'c1', workspaceIds: ['w1'] })
    const ws2 = createMockWS({ userId: 'u2', clientId: 'c2', workspaceIds: ['w2'] })

    manager.addConnection(ws1)
    manager.addConnection(ws2)

    manager.broadcast('w1', { type: 'task:created', data: { id: 't1' }, clientId: 'c1' })

    expect(ws1.sentMessages).toHaveLength(1)
    expect(ws2.sentMessages).toHaveLength(0)
  })

  test('removeConnection cleans up from all workspaces', () => {
    const manager = new WebSocketManager()
    const ws = createMockWS({ userId: 'u1', clientId: 'c1', workspaceIds: ['w1', 'w2'] })

    manager.addConnection(ws)
    expect(manager.connections.get('w1')?.size).toBe(1)
    expect(manager.connections.get('w2')?.size).toBe(1)

    manager.removeConnection(ws)
    expect(manager.connections.has('w1')).toBe(false)
    expect(manager.connections.has('w2')).toBe(false)
  })

  test('broadcast without excludeClientId sends to all sockets', () => {
    const manager = new WebSocketManager()
    const ws1 = createMockWS({ userId: 'u1', clientId: 'c1', workspaceIds: ['w1'] })
    const ws2 = createMockWS({ userId: 'u2', clientId: 'c2', workspaceIds: ['w1'] })

    manager.addConnection(ws1)
    manager.addConnection(ws2)

    manager.broadcast('w1', { type: 'test' })

    expect(ws1.sentMessages).toHaveLength(1)
    expect(ws2.sentMessages).toHaveLength(1)
  })
})
