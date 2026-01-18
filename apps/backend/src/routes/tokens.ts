import { zValidator } from '@hono/zod-validator'
import { createId } from '@paralleldrive/cuid2'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { apiTokens } from '../db/schema'
import { generateApiToken, getTokenPrefix, hashToken } from '../lib/tokens'
import { getUser, requireAuth } from '../middleware/auth'

const app = new Hono()

// All routes require session auth (for managing tokens via the UI)
app.use('/*', requireAuth)

const createTokenSchema = z.object({
  name: z.string().min(1).max(100),
})

// GET /api/tokens - List all tokens for the current user
app.get('/', async (c) => {
  const user = getUser(c)

  const tokens = await db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      tokenPrefix: apiTokens.tokenPrefix,
      lastUsedAt: apiTokens.lastUsedAt,
      createdAt: apiTokens.createdAt,
    })
    .from(apiTokens)
    .where(eq(apiTokens.userId, user.id))
    .orderBy(apiTokens.createdAt)

  return c.json(tokens)
})

// POST /api/tokens - Create a new token
app.post('/', zValidator('json', createTokenSchema), async (c) => {
  const user = getUser(c)
  const data = c.req.valid('json')

  const token = generateApiToken()
  const tokenHash = await hashToken(token)
  const tokenPrefix = getTokenPrefix(token)

  const result = await db
    .insert(apiTokens)
    .values({
      id: createId(),
      userId: user.id,
      name: data.name,
      tokenHash,
      tokenPrefix,
    })
    .returning({
      id: apiTokens.id,
      name: apiTokens.name,
      tokenPrefix: apiTokens.tokenPrefix,
      createdAt: apiTokens.createdAt,
    })

  // Return the full token ONLY on creation (never stored/returned again)
  return c.json(
    {
      ...result[0],
      token, // Full token - show once!
    },
    201,
  )
})

// DELETE /api/tokens/:id - Delete a token
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const user = getUser(c)

  const result = await db
    .delete(apiTokens)
    .where(and(eq(apiTokens.id, id), eq(apiTokens.userId, user.id)))
    .returning()

  if (result.length === 0) {
    return c.json({ error: 'Token not found' }, 404)
  }

  return c.json({ success: true })
})

export default app
