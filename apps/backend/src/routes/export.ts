import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db'
import { lists, tasks } from '../db/schema'
import { getUser, requireAuth } from '../middleware/auth'

const app = new Hono()

// Apply authentication middleware to all routes
app.use('/*', requireAuth)

// GET /api/export - Export all user data as JSON
app.get('/', async (c) => {
  const user = getUser(c)

  // Fetch all lists and tasks for this user
  const userLists = await db.select().from(lists).where(eq(lists.userId, user.id))
  const userTasks = await db.select().from(tasks).where(eq(tasks.userId, user.id))

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userId: user.id,
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
