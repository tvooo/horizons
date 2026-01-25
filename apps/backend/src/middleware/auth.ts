import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'
import { db } from '../db'
import { workspaceMembers } from '../db/schema'
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
