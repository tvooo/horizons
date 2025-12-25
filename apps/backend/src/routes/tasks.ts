import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { tasks } from '../db/schema'

const app = new Hono()

const scheduledDateSchema = z.object({
  periodType: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  anchorDate: z.string().datetime(),
})

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  listId: z.number().optional(),
  completed: z.boolean().optional(),
  scheduledDate: scheduledDateSchema.optional(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  listId: z.number().optional(),
  completed: z.boolean().optional(),
  scheduledDate: scheduledDateSchema.optional(),
})

// GET /api/tasks - Get all tasks
app.get('/', async (c) => {
  const allTasks = await db.select().from(tasks)
  return c.json(allTasks)
})

// GET /api/tasks/:id - Get a specific task
app.get('/:id', async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)

  if (Number.isNaN(id)) {
    return c.json({ error: 'Invalid task ID' }, 400)
  }

  const task = await db.select().from(tasks).where(eq(tasks.id, id))

  if (task.length === 0) {
    return c.json({ error: 'Task not found' }, 404)
  }

  return c.json(task[0])
})

// POST /api/tasks - Create a new task
app.post('/', zValidator('json', createTaskSchema), async (c) => {
  const data = c.req.valid('json')

  const result = await db
    .insert(tasks)
    .values({
      title: data.title,
      description: data.description,
      listId: data.listId,
      completed: data.completed ?? false,
      scheduledPeriodType: data.scheduledDate?.periodType,
      scheduledAnchorDate: data.scheduledDate ? new Date(data.scheduledDate.anchorDate) : undefined,
    })
    .returning()

  return c.json(result[0], 201)
})

// PATCH /api/tasks/:id - Update a task
app.patch('/:id', zValidator('json', updateTaskSchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'))
  const data = c.req.valid('json')

  if (Number.isNaN(id)) {
    return c.json({ error: 'Invalid task ID' }, 400)
  }

  const updateData: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    listId: data.listId,
    completed: data.completed,
    updatedAt: new Date(),
  }

  if (data.scheduledDate) {
    updateData.scheduledPeriodType = data.scheduledDate.periodType
    updateData.scheduledAnchorDate = new Date(data.scheduledDate.anchorDate)
  }

  const result = await db.update(tasks).set(updateData).where(eq(tasks.id, id)).returning()

  if (result.length === 0) {
    return c.json({ error: 'Task not found' }, 404)
  }

  return c.json(result[0])
})

export default app
