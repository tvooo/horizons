import { and, eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'
import { db } from '../db'
import { workspaceMembers, workspaces } from '../db/schema'
import { auth } from '../lib/auth'

export const requireAuth = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // Add user to context
  c.set('user', session.user)
  c.set('session', session.session)

  await next()
})

// Helper to get user from context (with type safety)
export const getUser = (c: Context) => {
  return c.get('user') as { id: string; email: string; name: string }
}

// Helper to get user's workspace IDs
export async function getUserWorkspaceIds(userId: string): Promise<string[]> {
  const memberships = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
  return memberships.map((m) => m.workspaceId)
}

// Helper to get user's personal workspace ID
export async function getUserPersonalWorkspaceId(userId: string): Promise<string | null> {
  const result = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(and(eq(workspaceMembers.userId, userId), eq(workspaces.type, 'personal')))
    .limit(1)
  return result[0]?.workspaceId ?? null
}
