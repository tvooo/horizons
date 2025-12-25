import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import listsRoutes from './routes/lists'
import tasksRoutes from './routes/tasks'

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './public' }))
}

// API routes
app.get('/api/health', (c) => c.json({ status: 'ok' }))
app.route('/api/lists', listsRoutes)
app.route('/api/tasks', tasksRoutes)

// SPA fallback for React Router in production
if (process.env.NODE_ENV === 'production') {
  app.get('/*', serveStatic({ path: './public/index.html' }))
}

const port = process.env.PORT || 3000
console.log(`🚀 Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
