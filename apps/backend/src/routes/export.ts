import { inArray } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db'
import { lists, tasks } from '../db/schema'
import { getUser, getUserWorkspaceIds, requireAuth } from '../middleware/auth'

const app = new Hono()

// Apply authentication middleware to all routes
app.use('/*', requireAuth)

// GET /api/export - Export all user data as JSON
app.get('/', async (c) => {
  const user = getUser(c)
  const workspaceIds = await getUserWorkspaceIds(user.id)

  // Fetch all lists and tasks from user's workspaces
  const userLists =
    workspaceIds.length > 0
      ? await db.select().from(lists).where(inArray(lists.workspaceId, workspaceIds))
      : []
  const userTasks =
    workspaceIds.length > 0
      ? await db.select().from(tasks).where(inArray(tasks.workspaceId, workspaceIds))
      : []

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userId: user.id,
    workspaceIds,
    lists: userLists,
    tasks: userTasks,
  }

  // Set headers for file download
  c.header('Content-Type', 'application/json')
  c.header(
    'Content-Disposition',
    `attachment; filename="horizons-export-${new Date().toISOString().split('T')[0]}.json"`,
  )

  return c.json(exportData)
})

export default app
