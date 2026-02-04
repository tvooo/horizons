import { describe, expect, test } from 'bun:test'
import type { BackendList, BackendTask } from '../api/types'
import type { WSMessage } from '../api/wsTypes'
import { ListModel } from '../models/ListModel'
import { RootStore } from '../models/RootStore'
import { TaskModel } from '../models/TaskModel'
import { WebSocketClient } from './WebSocketClient'

function createMockStore(): RootStore {
  // Create a minimal mock API client
  const mockApi = {} as ConstructorParameters<typeof RootStore>[0]
  const store = new RootStore(mockApi)
  store.tasks = []
  store.lists = []
  return store
}

const baseTask: BackendTask = {
  id: 't1',
  title: 'Test Task',
  notes: null,
  workspaceId: 'w1',
  listId: null,
  completed: false,
  scheduledPeriodType: null,
  scheduledAnchorDate: null,
  onIce: false,
  scheduleOrder: null,
  listOrder: null,
  completedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const baseList: BackendList = {
  id: 'l1',
  name: 'Test List',
  type: 'list',
  workspaceId: 'w1',
  parentListId: null,
  archived: false,
  scheduledPeriodType: null,
  scheduledAnchorDate: null,
  onIce: false,
  notes: null,
  archivedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

describe('WebSocketClient', () => {
  test('task:created adds new TaskModel to store', () => {
    const store = createMockStore()
    const client = new WebSocketClient(store, 'http://localhost:3000')

    const message: WSMessage = { type: 'task:created', data: baseTask, clientId: 'c1' }
    client.handleMessage(message)

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].id).toBe('t1')
    expect(store.tasks[0].title).toBe('Test Task')
    expect(store.tasks[0]).toBeInstanceOf(TaskModel)
  })

  test('task:updated modifies existing task fields', () => {
    const store = createMockStore()
    store.tasks.push(new TaskModel(baseTask, store))
    const client = new WebSocketClient(store, 'http://localhost:3000')

    const updated = { ...baseTask, title: 'Updated Title', completed: true }
    const message: WSMessage = { type: 'task:updated', data: updated, clientId: 'c1' }
    client.handleMessage(message)

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('Updated Title')
    expect(store.tasks[0].completed).toBe(true)
  })

  test('list:created adds new ListModel to store', () => {
    const store = createMockStore()
    const client = new WebSocketClient(store, 'http://localhost:3000')

    const message: WSMessage = { type: 'list:created', data: baseList, clientId: 'c1' }
    client.handleMessage(message)

    expect(store.lists).toHaveLength(1)
    expect(store.lists[0].id).toBe('l1')
    expect(store.lists[0].name).toBe('Test List')
    expect(store.lists[0]).toBeInstanceOf(ListModel)
  })

  test('list:updated modifies existing list fields', () => {
    const store = createMockStore()
    store.lists.push(new ListModel(baseList, store))
    const client = new WebSocketClient(store, 'http://localhost:3000')

    const updated = { ...baseList, name: 'Updated List', archived: true }
    const message: WSMessage = { type: 'list:updated', data: updated, clientId: 'c1' }
    client.handleMessage(message)

    expect(store.lists).toHaveLength(1)
    expect(store.lists[0].name).toBe('Updated List')
    expect(store.lists[0].archived).toBe(true)
  })

  test('duplicate created events are ignored', () => {
    const store = createMockStore()
    const client = new WebSocketClient(store, 'http://localhost:3000')

    const taskMessage: WSMessage = { type: 'task:created', data: baseTask, clientId: 'c1' }
    client.handleMessage(taskMessage)
    client.handleMessage(taskMessage)
    expect(store.tasks).toHaveLength(1)

    const listMessage: WSMessage = { type: 'list:created', data: baseList, clientId: 'c1' }
    client.handleMessage(listMessage)
    client.handleMessage(listMessage)
    expect(store.lists).toHaveLength(1)
  })
})
