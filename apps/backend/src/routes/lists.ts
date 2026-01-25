import { zValidator } from '@hono/zod-validator'
import { createId } from '@paralleldrive/cuid2'
import { and, eq, inArray } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { lists } from '../db/schema'
import { getUser, getUserWorkspaceIds, requireAuth } from '../middleware/auth'

const app = new Hono()

// Apply authentication middleware to all routes
app.use('/*', requireAuth)

const scheduledDateSchema = z.object({
  periodType: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  anchorDate: z.string().datetime(),
})

const createListSchema = z.object({
  name: z.string().min(1),
  workspaceId: z.string().min(1),
  type: z.enum(['area', 'project', 'list']).optional(),
  parentListId: z.string().optional(),
  scheduledDate: scheduledDateSchema.optional(),
  onIce: z.boolean().optional(),
  notes: z.string().optional(),
})

const updateListSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['area', 'project', 'list']).optional(),
  parentListId: z.string().nullable().optional(),
  archived: z.boolean().optional(),
  scheduledDate: scheduledDateSchema.nullable().optional(),
  onIce: z.boolean().optional(),
  notes: z.string().optional(),
})

// GET /api/lists - Get all lists from user's workspaces
app.get('/', async (c) => {
  const user = getUser(c)
  const workspaceIds = await getUserWorkspaceIds(user.id)

  if (workspaceIds.length === 0) {
    return c.json([])
  }

  const allLists = await db.select().from(lists).where(inArray(lists.workspaceId, workspaceIds))
  return c.json(allLists)
})

// GET /api/lists/:id - Get a specific list
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const user = getUser(c)
  const workspaceIds = await getUserWorkspaceIds(user.id)

  if (workspaceIds.length === 0) {
    return c.json({ error: 'List not found' }, 404)
  }

  const list = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, id), inArray(lists.workspaceId, workspaceIds)))

  if (list.length === 0) {
    return c.json({ error: 'List not found' }, 404)
  }

  return c.json(list[0])
})

// POST /api/lists - Create a new list
app.post('/', zValidator('json', createListSchema), async (c) => {
  const data = c.req.valid('json')
  const user = getUser(c)
  const workspaceIds = await getUserWorkspaceIds(user.id)

  // Verify user has access to the workspace
  if (!workspaceIds.includes(data.workspaceId)) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  const result = await db
    .insert(lists)
    .values({
      id: createId(),
      name: data.name,
      type: data.type ?? 'list',
      workspaceId: data.workspaceId,
      parentListId: data.parentListId,
      scheduledPeriodType: data.scheduledDate?.periodType,
      scheduledAnchorDate: data.scheduledDate ? new Date(data.scheduledDate.anchorDate) : undefined,
      onIce: data.onIce ?? false,
      notes: data.notes,
    })
    .returning()

  return c.json(result[0], 201)
})

// PATCH /api/lists/:id - Update a list
app.patch('/:id', zValidator('json', updateListSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')
  const user = getUser(c)

  const updateData: Record<string, unknown> = {
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
      // Mutual exclusion: scheduling clears onIce
      updateData.onIce = false
    }
  }

  // Mutual exclusion: onIce clears scheduling
  if (data.onIce === true) {
    updateData.scheduledPeriodType = null
    updateData.scheduledAnchorDate = null
    updateData.onIce = true
  }

  // Set archivedAt when archiving, clear it when unarchiving
  if (data.archived === true) {
    updateData.archivedAt = new Date()
  } else if (data.archived === false) {
    updateData.archivedAt = null
  }

  const workspaceIds = await getUserWorkspaceIds(user.id)

  if (workspaceIds.length === 0) {
    return c.json({ error: 'List not found' }, 404)
  }

  const result = await db
    .update(lists)
    .set(updateData)
    .where(and(eq(lists.id, id), inArray(lists.workspaceId, workspaceIds)))
    .returning()

  if (result.length === 0) {
    return c.json({ error: 'List not found' }, 404)
  }

  return c.json(result[0])
})

export default app
