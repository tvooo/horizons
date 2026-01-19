import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'
import { db, users } from '../db'
import { auth } from '../lib/auth'

export const requireAdmin = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.redirect('/signin')
  }

  // Look up user from database to get isAdmin field
  const user = await db.select().from(users).where(eq(users.id, session.user.id)).get()

  if (!user || !user.isAdmin) {
    return c.text('Forbidden: Admin access required', 403)
  }

  // Add user to context (with isAdmin from database)
  c.set('user', user)
  c.set('session', session.session)

  await next()
})

// Helper to get user from context (with type safety)
export const getUser = (c: Context) => {
  return c.get('user') as { id: string; email: string; name: string; isAdmin: boolean }
}
