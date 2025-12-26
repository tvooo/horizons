import { Hono } from 'hono'
import { auth } from '../lib/auth'

const app = new Hono()

// Better Auth handles all auth routes automatically
// Mount it at /api/auth/*
app.on(['GET', 'POST'], '/*', (c) => {
  return auth.handler(c.req.raw)
})

export default app
