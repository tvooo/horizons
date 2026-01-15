import { zValidator } from '@hono/zod-validator'
import { createId } from '@paralleldrive/cuid2'
import { inArray } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { lists, tasks } from '../db/schema'
import { getUser, requireAuth } from '../middleware/auth'

const app = new Hono()

// Apply authentication middleware to all routes
app.use('/*', requireAuth)

// Validation schema for import data
const importSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  userId: z.string(),
  lists: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['area', 'project', 'list']),
      parentListId: z.string().nullable(),
      archived: z.boolean(),
      scheduledPeriodType: z.enum(['day', 'week', 'month', 'quarter', 'year']).nullable(),
      scheduledAnchorDate: z.string().nullable(),
      onIce: z.boolean(),
      notes: z.string().nullable(),
      archivedAt: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      notes: z.string().nullable(),
      listId: z.string().nullable(),
      completed: z.boolean(),
      scheduledPeriodType: z.enum(['day', 'week', 'month', 'quarter', 'year']).nullable(),
      scheduledAnchorDate: z.string().nullable(),
      onIce: z.boolean(),
      scheduleOrder: z.string().nullable(),
      completedAt: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
})

// POST /api/import - Import user data from JSON
app.post('/', zValidator('json', importSchema), async (c) => {
  const data = c.req.valid('json')
  const user = getUser(c)

  // Check for ID conflicts
  const listIds = data.lists.map((list) => list.id)
  const taskIds = data.tasks.map((task) => task.id)

  const existingLists =
    listIds.length > 0
      ? await db.select({ id: lists.id }).from(lists).where(inArray(lists.id, listIds))
      : []

  const existingTasks =
    taskIds.length > 0
      ? await db.select({ id: tasks.id }).from(tasks).where(inArray(tasks.id, taskIds))
      : []

  // If there are conflicts, create a mapping of old IDs to new IDs
  const listIdMap = new Map<string, string>()
  const taskIdMap = new Map<string, string>()

  const hasConflicts = existingLists.length > 0 || existingTasks.length > 0

  if (hasConflicts) {
    // Map all list IDs (both conflicting and non-conflicting need mapping)
    for (const list of data.lists) {
      listIdMap.set(list.id, createId())
    }

    // Map all task IDs
    for (const task of data.tasks) {
      taskIdMap.set(task.id, createId())
    }
  }

  // Transform and insert lists
  const listsToInsert = data.lists.map((list) => {
    const newId = hasConflicts ? (listIdMap.get(list.id) ?? list.id) : list.id
    const newParentListId =
      list.parentListId && hasConflicts
        ? (listIdMap.get(list.parentListId) ?? list.parentListId)
        : list.parentListId

    return {
      id: newId,
      name: list.name,
      type: list.type,
      userId: user.id, // Always use current user's ID
      parentListId: newParentListId,
      archived: list.archived,
      scheduledPeriodType: list.scheduledPeriodType,
      scheduledAnchorDate: list.scheduledAnchorDate ? new Date(list.scheduledAnchorDate) : null,
      onIce: list.onIce,
      notes: list.notes,
      archivedAt: list.archivedAt ? new Date(list.archivedAt) : null,
      createdAt: new Date(list.createdAt),
      updatedAt: new Date(list.updatedAt),
    }
  })

  // Transform and insert tasks
  const tasksToInsert = data.tasks.map((task) => {
    const newId = hasConflicts ? (taskIdMap.get(task.id) ?? task.id) : task.id
    const newListId =
      task.listId && hasConflicts ? (listIdMap.get(task.listId) ?? task.listId) : task.listId

    return {
      id: newId,
      title: task.title,
      notes: task.notes,
      userId: user.id, // Always use current user's ID
      listId: newListId,
      completed: task.completed,
      scheduledPeriodType: task.scheduledPeriodType,
      scheduledAnchorDate: task.scheduledAnchorDate ? new Date(task.scheduledAnchorDate) : null,
      onIce: task.onIce,
      scheduleOrder: task.scheduleOrder,
      completedAt: task.completedAt ? new Date(task.completedAt) : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }
  })

  try {
    // Insert lists first (to satisfy foreign key constraints)
    if (listsToInsert.length > 0) {
      await db.insert(lists).values(listsToInsert)
    }

    // Insert tasks second
    if (tasksToInsert.length > 0) {
      await db.insert(tasks).values(tasksToInsert)
    }

    return c.json({
      success: true,
      imported: {
        lists: listsToInsert.length,
        tasks: tasksToInsert.length,
      },
      conflicts: hasConflicts,
    })
  } catch (error) {
    console.error('Import failed:', error)
    return c.json({ error: 'Failed to import data' }, 500)
  }
})

export default app
