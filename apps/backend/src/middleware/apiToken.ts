import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'
import { db } from '../db'
import { type ApiToken, apiTokens, users } from '../db/schema'
import { hashToken } from '../lib/tokens'

export const requireApiToken = createMiddleware(async (c, next) => {
  // Extract token from Authorization header or query param
  let token: string | undefined

  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    token = c.req.query('token')
  }

  if (!token) {
    return c.json({ error: 'API token required' }, 401)
  }

  // Validate token format (hzn_ prefix + 32 random chars = 36 total)
  if (!token.startsWith('hzn_') || token.length !== 36) {
    return c.json({ error: 'Invalid token format' }, 401)
  }

  const tokenHash = await hashToken(token)

  // Look up token and join with user
  const result = await db
    .select({
      token: apiTokens,
      user: users,
    })
    .from(apiTokens)
    .innerJoin(users, eq(apiTokens.userId, users.id))
    .where(eq(apiTokens.tokenHash, tokenHash))
    .limit(1)

  if (result.length === 0) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  const { token: apiToken, user } = result[0]

  // Update last used timestamp (fire and forget)
  db.update(apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiTokens.id, apiToken.id))
    .execute()
    .catch(console.error)

  // Add user to context (same pattern as session auth)
  c.set('user', { id: user.id, email: user.email, name: user.name })
  c.set('apiToken', apiToken)

  await next()
})

export const getApiToken = (c: Context) => {
  return c.get('apiToken') as ApiToken | undefined
}
