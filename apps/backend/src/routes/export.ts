import { createId } from '@paralleldrive/cuid2'
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

  // Create ID mappings for migration from numeric to cuid
  const listIdMap = new Map<number, string>()
  const taskIdMap = new Map<number, string>()

  // Check if we need to migrate IDs (if they're numeric)
  const needsMigration = userLists.length > 0 && typeof userLists[0].id === 'number'

  if (needsMigration) {
    // Generate cuids for all lists
    for (const list of userLists) {
      listIdMap.set(list.id as number, createId())
    }

    // Generate cuids for all tasks
    for (const task of userTasks) {
      taskIdMap.set(task.id as number, createId())
    }
  }

  // Transform lists with new IDs
  const exportedLists = userLists.map((list) => {
    const newId = needsMigration ? (listIdMap.get(list.id as number) ?? list.id) : list.id
    const newParentListId =
      list.parentListId && needsMigration
        ? listIdMap.get(list.parentListId as number) || null
        : list.parentListId

    return {
      ...list,
      id: newId,
      parentListId: newParentListId,
    }
  })

  // Transform tasks with new IDs
  const exportedTasks = userTasks.map((task) => {
    const newId = needsMigration ? (taskIdMap.get(task.id as number) ?? task.id) : task.id
    const newListId =
      task.listId && needsMigration ? listIdMap.get(task.listId as number) || null : task.listId

    return {
      ...task,
      id: newId,
      listId: newListId,
    }
  })

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userId: user.id,
    lists: exportedLists,
    tasks: exportedTasks,
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
