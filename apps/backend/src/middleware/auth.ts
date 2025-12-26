import { createMiddleware } from 'hono/factory'
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
export const getUser = (c: any) => {
  return c.get('user') as { id: string; email: string; name: string }
}
