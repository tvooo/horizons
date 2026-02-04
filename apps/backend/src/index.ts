import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth } from './lib/auth'
import { getUserWorkspaceIds } from './middleware/auth'
import authRoutes from './routes/auth'
import exportRoutes from './routes/export'
import importRoutes from './routes/import'
import listsRoutes from './routes/lists'
import tasksRoutes from './routes/tasks'
import tokensRoutes from './routes/tokens'
import webhookRoutes from './routes/webhook'
import workspacesRoutes from './routes/workspaces'
import { wsManager } from './ws/WebSocketManager'

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
app.route('/api/workspaces', workspacesRoutes)

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
  fetch(req: Request, server: ReturnType<typeof Bun.serve>) {
    const url = new URL(req.url)
    if (url.pathname === '/api/ws') {
      const clientId = url.searchParams.get('clientId') || ''
      // Authenticate and upgrade to WebSocket
      return auth.api.getSession({ headers: req.headers }).then((session) => {
        if (!session) {
          return new Response('Unauthorized', { status: 401 })
        }
        return getUserWorkspaceIds(session.user.id).then((workspaceIds) => {
          const upgraded = server.upgrade(req, {
            data: { userId: session.user.id, clientId, workspaceIds },
          })
          if (!upgraded) {
            return new Response('WebSocket upgrade failed', { status: 400 })
          }
          // Bun handles the response for upgraded connections
          return undefined as unknown as Response
        })
      })
    }
    return app.fetch(req, server)
  },
  websocket: {
    open(ws: import('bun').ServerWebSocket<import('./ws/WebSocketManager').WSData>) {
      wsManager.addConnection(ws)
    },
    close(ws: import('bun').ServerWebSocket<import('./ws/WebSocketManager').WSData>) {
      wsManager.removeConnection(ws)
    },
    message() {
      // Clients don't send messages to the server
    },
  },
}
