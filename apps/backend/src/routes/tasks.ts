import { zValidator } from '@hono/zod-validator'
import { createId } from '@paralleldrive/cuid2'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { tasks } from '../db/schema'
import { getUser, requireAuth } from '../middleware/auth'

const app = new Hono()

// Apply authentication middleware to all routes
app.use('/*', requireAuth)

const scheduledDateSchema = z.object({
  periodType: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  anchorDate: z.string().datetime(),
})

const createTaskSchema = z.object({
  title: z.string().min(1),
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
  scheduledDate: scheduledDateSchema.optional(),
  onIce: z.boolean().optional(),
  scheduleOrder: z.string().optional(),
  listOrder: z.string().optional(),
})

// GET /api/tasks - Get all tasks
app.get('/', async (c) => {
  const user = getUser(c)
  const allTasks = await db.select().from(tasks).where(eq(tasks.userId, user.id))
  return c.json(allTasks)
})

// GET /api/tasks/:id - Get a specific task
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const user = getUser(c)

  const task = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))

  if (task.length === 0) {
    return c.json({ error: 'Task not found' }, 404)
  }

  return c.json(task[0])
})

// POST /api/tasks - Create a new task
app.post('/', zValidator('json', createTaskSchema), async (c) => {
  const data = c.req.valid('json')
  const user = getUser(c)

  const result = await db
    .insert(tasks)
    .values({
      id: createId(),
      title: data.title,
      notes: data.notes,
      userId: user.id,
      listId: data.listId,
      completed: data.completed ?? false,
      scheduledPeriodType: data.scheduledDate?.periodType,
      scheduledAnchorDate: data.scheduledDate ? new Date(data.scheduledDate.anchorDate) : undefined,
      onIce: data.onIce ?? false,
      scheduleOrder: data.scheduleOrder,
      listOrder: data.listOrder,
    })
    .returning()

  return c.json(result[0], 201)
})

// PATCH /api/tasks/:id - Update a task
app.patch('/:id', zValidator('json', updateTaskSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')
  const user = getUser(c)

  const updateData: Record<string, unknown> = {
    title: data.title,
    notes: data.notes,
    listId: data.listId,
    completed: data.completed,
    scheduleOrder: data.scheduleOrder,
    listOrder: data.listOrder,
    updatedAt: new Date(),
  }

  // Set completedAt when completing, clear it when uncompleting
  if (data.completed === true) {
    updateData.completedAt = new Date()
  } else if (data.completed === false) {
    updateData.completedAt = null
  }

  // Mutual exclusion: scheduling clears onIce
  if (data.scheduledDate) {
    updateData.scheduledPeriodType = data.scheduledDate.periodType
    updateData.scheduledAnchorDate = new Date(data.scheduledDate.anchorDate)
    updateData.onIce = false
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
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning()

  if (result.length === 0) {
    return c.json({ error: 'Task not found' }, 404)
  }

  return c.json(result[0])
})

export default app
