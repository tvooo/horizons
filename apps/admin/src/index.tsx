import { eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { db, users } from './db'
import { auth } from './lib/auth'
import { getUser, requireAdmin } from './middleware/requireAdmin'
import { Dashboard } from './views/Dashboard'
import { SignIn } from './views/SignIn'

const app = new Hono()

app.use('*', logger())

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Better Auth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

// Sign in page
app.get('/signin', async (c) => {
  // Check if already logged in as admin
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (session) {
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).get()
    if (user?.isAdmin) {
      return c.redirect('/')
    }
  }

  const error = c.req.query('error')
  return c.html(<SignIn error={error} />)
})

// Dashboard (protected)
app.get('/', requireAdmin, async (c) => {
  const currentUser = getUser(c)

  // Get all users with counts using subqueries
  const usersWithCounts = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      isAdmin: users.isAdmin,
      listCount: sql<number>`(SELECT COUNT(*) FROM lists WHERE lists.user_id = ${users.id})`,
      taskCount: sql<number>`(SELECT COUNT(*) FROM tasks WHERE tasks.user_id = ${users.id})`,
      tokenCount: sql<number>`(SELECT COUNT(*) FROM api_tokens WHERE api_tokens.user_id = ${users.id})`,
    })
    .from(users)
    .orderBy(users.createdAt)

  return c.html(<Dashboard users={usersWithCounts} currentUser={currentUser} />)
})

const port = Number(process.env.PORT) || 3001
console.log(`Admin server running on http://localhost:${port}`)

export default { port, fetch: app.fetch }
