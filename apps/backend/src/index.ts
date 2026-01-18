import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import authRoutes from './routes/auth'
import exportRoutes from './routes/export'
import importRoutes from './routes/import'
import listsRoutes from './routes/lists'
import tasksRoutes from './routes/tasks'
import tokensRoutes from './routes/tokens'
import webhookRoutes from './routes/webhook'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const publicDir = join(__dirname, '../public')

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)

// API routes (must come before static files)
app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.route('/api/auth', authRoutes)
app.route('/api/lists', listsRoutes)
app.route('/api/tasks', tasksRoutes)
app.route('/api/export', exportRoutes)
app.route('/api/import', importRoutes)
app.route('/api/tokens', tokensRoutes)
app.route('/api/webhook', webhookRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  console.log(`Serving static files from ${publicDir}`)
  app.get('*', serveStatic({ root: publicDir }))

  // SPA fallback - serve index.html for all non-file routes
  app.get('*', async (c, _next) => {
    return c.html(await Bun.file(join(publicDir, 'index.html')).text())
  })
}

const port = process.env.PORT || 3000
console.log(`🚀 Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
