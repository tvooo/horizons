import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { lists } from '../db/schema'

const app = new Hono()

const scheduledDateSchema = z.object({
  periodType: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  anchorDate: z.string().datetime(),
})

const createListSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['area', 'project', 'list']).optional(),
  parentListId: z.number().optional(),
  scheduledDate: scheduledDateSchema.optional(),
})

const updateListSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['area', 'project', 'list']).optional(),
  parentListId: z.number().nullable().optional(),
  scheduledDate: scheduledDateSchema.nullable().optional(),
})

// GET /api/lists - Get all lists
app.get('/', async (c) => {
  const allLists = await db.select().from(lists)
  return c.json(allLists)
})

// GET /api/lists/:id - Get a specific list
app.get('/:id', async (c) => {
  const id = Number.parseInt(c.req.param('id'))

  if (Number.isNaN(id)) {
    return c.json({ error: 'Invalid list ID' }, 400)
  }

  const list = await db.select().from(lists).where(eq(lists.id, id))

  if (list.length === 0) {
    return c.json({ error: 'List not found' }, 404)
  }

  return c.json(list[0])
})

// POST /api/lists - Create a new list
app.post('/', zValidator('json', createListSchema), async (c) => {
  const data = c.req.valid('json')

  const result = await db
    .insert(lists)
    .values({
      name: data.name,
      type: data.type ?? 'list',
      parentListId: data.parentListId,
      scheduledPeriodType: data.scheduledDate?.periodType,
      scheduledAnchorDate: data.scheduledDate ? new Date(data.scheduledDate.anchorDate) : undefined,
    })
    .returning()

  return c.json(result[0], 201)
})

// PATCH /api/lists/:id - Update a list
app.patch('/:id', zValidator('json', updateListSchema), async (c) => {
  const id = Number.parseInt(c.req.param('id'), 10)
  const data = c.req.valid('json')

  if (Number.isNaN(id)) {
    return c.json({ error: 'Invalid list ID' }, 400)
  }

  const updateData: any = {
    ...data,
    updatedAt: new Date(),
  }

  // Handle scheduledDate transformation
  if ('scheduledDate' in data) {
    delete updateData.scheduledDate
    if (data.scheduledDate === null) {
      updateData.scheduledPeriodType = null
      updateData.scheduledAnchorDate = null
    } else if (data.scheduledDate) {
      updateData.scheduledPeriodType = data.scheduledDate.periodType
      updateData.scheduledAnchorDate = new Date(data.scheduledDate.anchorDate)
    }
  }

  const result = await db.update(lists).set(updateData).where(eq(lists.id, id)).returning()

  if (result.length === 0) {
    return c.json({ error: 'List not found' }, 404)
  }

  return c.json(result[0])
})

export default app
