import { zValidator } from '@hono/zod-validator'
import { createId } from '@paralleldrive/cuid2'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { tasks } from '../db/schema'
import { requireApiToken } from '../middleware/apiToken'
// getUser works with API token auth because requireApiToken sets user context
// in the same format as requireAuth (session-based auth)
import { getUser, getUserWorkspaceIds } from '../middleware/auth'

const app = new Hono()

// Webhook routes use API token auth
app.use('/*', requireApiToken)

const createInboxTaskSchema = z.object({
  title: z.string().min(1).max(500),
  notes: z.string().max(10000).optional(),
})

// POST /api/webhook/inbox - Create a task in the inbox
app.post('/inbox', zValidator('json', createInboxTaskSchema), async (c) => {
  const user = getUser(c)
  const data = c.req.valid('json')

  // Get user's first workspace (personal workspace) for inbox tasks
  const workspaceIds = await getUserWorkspaceIds(user.id)
  if (workspaceIds.length === 0) {
    return c.json({ error: 'No workspace available' }, 400)
  }

  const result = await db
    .insert(tasks)
    .values({
      id: createId(),
      title: data.title,
      notes: data.notes,
      workspaceId: workspaceIds[0], // Use first workspace (personal)
      listId: null, // Inbox = null listId
      completed: false,
      onIce: false,
    })
    .returning()

  return c.json(
    {
      success: true,
      task: {
        id: result[0].id,
        title: result[0].title,
        notes: result[0].notes,
        createdAt: result[0].createdAt,
      },
    },
    201,
  )
})

export default app
