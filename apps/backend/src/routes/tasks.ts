import { zValidator } from '@hono/zod-validator'
import { createId } from '@paralleldrive/cuid2'
import { and, eq, inArray } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { lists, tasks } from '../db/schema'
import { getUser, getUserWorkspaceIds, requireAuth } from '../middleware/auth'
import { wsManager } from '../ws/WebSocketManager'

const app = new Hono()

// Apply authentication middleware to all routes
app.use('/*', requireAuth)

const scheduledDateSchema = z.object({
  periodType: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  anchorDate: z.string().datetime(),
})

const createTaskSchema = z.object({
  title: z.string().min(1),
  workspaceId: z.string().min(1),
  notes: z.string().optional(),
  listId: z.string().optional(),
  completed: z.boolean().optional(),
  scheduledDate: scheduledDateSchema.optional(),
  onIce: z.boolean().optional(),
  scheduleOrder: z.string().optional(),
  listOrder: z.string().optional(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().optional(),
  listId: z.string().nullable().optional(),
  completed: z.boolean().optional(),
  scheduledDate: scheduledDateSchema.nullable().optional(),
  onIce: z.boolean().optional(),
  scheduleOrder: z.string().nullable().optional(),
  listOrder: z.string().nullable().optional(),
  workspaceId: z.string().optional(),
})

// GET /api/tasks - Get all tasks from user's workspaces
app.get('/', async (c) => {
  const user = getUser(c)
  const workspaceIds = await getUserWorkspaceIds(user.id)

  if (workspaceIds.length === 0) {
    return c.json([])
  }

  const allTasks = await db.select().from(tasks).where(inArray(tasks.workspaceId, workspaceIds))
  return c.json(allTasks)
})

// GET /api/tasks/:id - Get a specific task
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const user = getUser(c)
  const workspaceIds = await getUserWorkspaceIds(user.id)

  if (workspaceIds.length === 0) {
    return c.json({ error: 'Task not found' }, 404)
  }

  const task = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), inArray(tasks.workspaceId, workspaceIds)))

  if (task.length === 0) {
    return c.json({ error: 'Task not found' }, 404)
  }

  return c.json(task[0])
})

// POST /api/tasks - Create a new task
app.post('/', zValidator('json', createTaskSchema), async (c) => {
  const data = c.req.valid('json')
  const user = getUser(c)
  const workspaceIds = await getUserWorkspaceIds(user.id)

  // Verify user has access to the workspace
  if (!workspaceIds.includes(data.workspaceId)) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  // If creating in a list, use the list's workspace
  let workspaceId = data.workspaceId
  if (data.listId) {
    const [list] = await db.select().from(lists).where(eq(lists.id, data.listId))
    if (!list) {
      return c.json({ error: 'List not found' }, 404)
    }
    if (!workspaceIds.includes(list.workspaceId)) {
      return c.json({ error: 'List not found' }, 404)
    }
    // Use the list's workspace
    workspaceId = list.workspaceId
  }

  const result = await db
    .insert(tasks)
    .values({
      id: createId(),
      title: data.title,
      notes: data.notes,
      workspaceId,
      listId: data.listId,
      completed: data.completed ?? false,
      scheduledPeriodType: data.scheduledDate?.periodType,
      scheduledAnchorDate: data.scheduledDate ? new Date(data.scheduledDate.anchorDate) : undefined,
      onIce: data.onIce ?? false,
      scheduleOrder: data.scheduleOrder,
      listOrder: data.listOrder,
    })
    .returning()

  const clientId = c.req.header('X-Client-Id') || ''
  wsManager.broadcast(workspaceId, { type: 'task:created', data: result[0], clientId }, clientId)

  return c.json(result[0], 201)
})

// PATCH /api/tasks/:id - Update a task
app.patch('/:id', zValidator('json', updateTaskSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')
  const user = getUser(c)
  const workspaceIds = await getUserWorkspaceIds(user.id)

  if (workspaceIds.length === 0) {
    return c.json({ error: 'Task not found' }, 404)
  }

  // If moving to a list, get the list's workspace
  let workspaceId = data.workspaceId
  if (data.listId) {
    const [list] = await db.select().from(lists).where(eq(lists.id, data.listId))
    if (!list) {
      return c.json({ error: 'List not found' }, 404)
    }
    if (!workspaceIds.includes(list.workspaceId)) {
      return c.json({ error: 'List not found' }, 404)
    }
    // Use the list's workspace
    workspaceId = list.workspaceId
  }

  // Verify user has access to target workspace if explicitly changing workspace
  if (workspaceId && !workspaceIds.includes(workspaceId)) {
    return c.json({ error: 'Target workspace not found' }, 404)
  }

  const updateData: Record<string, unknown> = {
    title: data.title,
    notes: data.notes,
    listId: data.listId,
    completed: data.completed,
    scheduleOrder: data.scheduleOrder,
    listOrder: data.listOrder,
    workspaceId: workspaceId,
    updatedAt: new Date(),
  }

  // Set completedAt when completing, clear it when uncompleting
  if (data.completed === true) {
    updateData.completedAt = new Date()
  } else if (data.completed === false) {
    updateData.completedAt = null
  }

  // Handle scheduledDate: set, clear, or leave unchanged
  if (data.scheduledDate === null) {
    // Explicitly clear the schedule
    updateData.scheduledPeriodType = null
    updateData.scheduledAnchorDate = null
  } else if (data.scheduledDate) {
    // Mutual exclusion: scheduling clears onIce
    updateData.scheduledPeriodType = data.scheduledDate.periodType
    updateData.scheduledAnchorDate = new Date(data.scheduledDate.anchorDate)
    updateData.onIce = false
  }

  // Handle scheduleOrder: set, clear, or leave unchanged
  if (data.scheduleOrder === null) {
    updateData.scheduleOrder = null
  }

  // Mutual exclusion: onIce clears scheduling
  if (data.onIce === true) {
    updateData.scheduledPeriodType = null
    updateData.scheduledAnchorDate = null
    updateData.onIce = true
  } else if (data.onIce === false) {
    updateData.onIce = false
  }

  const result = await db
    .update(tasks)
    .set(updateData)
    .where(and(eq(tasks.id, id), inArray(tasks.workspaceId, workspaceIds)))
    .returning()

  if (result.length === 0) {
    return c.json({ error: 'Task not found' }, 404)
  }

  const clientId = c.req.header('X-Client-Id') || ''
  wsManager.broadcast(
    result[0].workspaceId,
    { type: 'task:updated', data: result[0], clientId },
    clientId,
  )

  return c.json(result[0])
})

export default app
