import { zValidator } from '@hono/zod-validator'
import { createId } from '@paralleldrive/cuid2'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { users, workspaceInvites, workspaceMembers, workspaces } from '../db/schema'
import { getUser, requireAuth } from '../middleware/auth'

const app = new Hono()

// Apply authentication middleware to all routes
app.use('/*', requireAuth)

const createWorkspaceSchema = z.object({
  name: z.string().min(1),
})

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional(),
})

const createInviteSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  usageLimit: z.number().positive().optional(),
})

// Helper to check if user is a member of workspace
async function getMembership(workspaceId: string, userId: string) {
  const members = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
  return members[0] || null
}

// Helper to generate short random invite code
function generateInviteCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// GET /api/workspaces - Get all workspaces user is a member of
app.get('/', async (c) => {
  const user = getUser(c)

  const userWorkspaces = await db
    .select({
      workspace: workspaces,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, user.id))

  return c.json(userWorkspaces.map((w) => ({ ...w.workspace, role: w.role })))
})

// POST /api/workspaces - Create a new shared workspace
app.post('/', zValidator('json', createWorkspaceSchema), async (c) => {
  const data = c.req.valid('json')
  const user = getUser(c)

  const workspaceId = createId()

  // Create workspace
  const [workspace] = await db
    .insert(workspaces)
    .values({
      id: workspaceId,
      name: data.name,
      type: 'shared',
    })
    .returning()

  // Add creator as owner
  await db.insert(workspaceMembers).values({
    id: createId(),
    workspaceId: workspaceId,
    userId: user.id,
    role: 'owner',
  })

  return c.json({ ...workspace, role: 'owner' }, 201)
})

// GET /api/workspaces/:id - Get workspace details
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const user = getUser(c)

  const membership = await getMembership(id, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id))

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  return c.json({ ...workspace, role: membership.role })
})

// PATCH /api/workspaces/:id - Update workspace
app.patch('/:id', zValidator('json', updateWorkspaceSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')
  const user = getUser(c)

  const membership = await getMembership(id, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  const result = await db
    .update(workspaces)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(workspaces.id, id))
    .returning()

  if (result.length === 0) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  return c.json({ ...result[0], role: membership.role })
})

// DELETE /api/workspaces/:id - Delete workspace (owner only)
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const user = getUser(c)

  const membership = await getMembership(id, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  if (membership.role !== 'owner') {
    return c.json({ error: 'Only workspace owners can delete workspaces' }, 403)
  }

  // Check if this is a personal workspace
  const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id))
  if (workspace?.type === 'personal') {
    return c.json({ error: 'Cannot delete personal workspace' }, 403)
  }

  await db.delete(workspaces).where(eq(workspaces.id, id))

  return c.json({ success: true })
})

// GET /api/workspaces/:id/members - Get workspace members
app.get('/:id/members', async (c) => {
  const id = c.req.param('id')
  const user = getUser(c)

  const membership = await getMembership(id, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  const members = await db
    .select({
      id: workspaceMembers.id,
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      createdAt: workspaceMembers.createdAt,
      userName: users.name,
      userEmail: users.email,
      userImage: users.image,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, id))

  return c.json(members)
})

// DELETE /api/workspaces/:id/members/:userId - Remove member from workspace
app.delete('/:id/members/:userId', async (c) => {
  const workspaceId = c.req.param('id')
  const targetUserId = c.req.param('userId')
  const user = getUser(c)

  const membership = await getMembership(workspaceId, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  // Check if removing self or if user is owner
  const isSelf = targetUserId === user.id
  const isOwner = membership.role === 'owner'

  if (!isSelf && !isOwner) {
    return c.json({ error: 'Only owners can remove other members' }, 403)
  }

  // Cannot remove the last owner
  if (isOwner && isSelf) {
    const owners = await db
      .select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, 'owner')))

    if (owners.length <= 1) {
      return c.json({ error: 'Cannot remove the last owner' }, 403)
    }
  }

  await db
    .delete(workspaceMembers)
    .where(
      and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, targetUserId)),
    )

  return c.json({ success: true })
})

// POST /api/workspaces/:id/invites - Create invite link
app.post('/:id/invites', zValidator('json', createInviteSchema.optional()), async (c) => {
  const workspaceId = c.req.param('id')
  const data = c.req.valid('json') || {}
  const user = getUser(c)

  const membership = await getMembership(workspaceId, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  const [invite] = await db
    .insert(workspaceInvites)
    .values({
      id: createId(),
      workspaceId,
      code: generateInviteCode(),
      createdBy: user.id,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      usageLimit: data.usageLimit,
    })
    .returning()

  return c.json(invite, 201)
})

// GET /api/workspaces/:id/invites - List workspace invites
app.get('/:id/invites', async (c) => {
  const workspaceId = c.req.param('id')
  const user = getUser(c)

  const membership = await getMembership(workspaceId, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  const invites = await db
    .select()
    .from(workspaceInvites)
    .where(eq(workspaceInvites.workspaceId, workspaceId))

  return c.json(invites)
})

// DELETE /api/workspaces/:id/invites/:inviteId - Delete invite
app.delete('/:id/invites/:inviteId', async (c) => {
  const workspaceId = c.req.param('id')
  const inviteId = c.req.param('inviteId')
  const user = getUser(c)

  const membership = await getMembership(workspaceId, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  await db
    .delete(workspaceInvites)
    .where(and(eq(workspaceInvites.id, inviteId), eq(workspaceInvites.workspaceId, workspaceId)))

  return c.json({ success: true })
})

// POST /api/workspaces/join/:code - Join workspace via invite code
app.post('/join/:code', async (c) => {
  const code = c.req.param('code')
  const user = getUser(c)

  // Find the invite
  const [invite] = await db.select().from(workspaceInvites).where(eq(workspaceInvites.code, code))

  if (!invite) {
    return c.json({ error: 'Invalid invite code' }, 404)
  }

  // Check if expired
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return c.json({ error: 'Invite has expired' }, 410)
  }

  // Check usage limit
  if (invite.usageLimit && invite.usageCount >= invite.usageLimit) {
    return c.json({ error: 'Invite has reached usage limit' }, 410)
  }

  // Check if already a member
  const existingMembership = await getMembership(invite.workspaceId, user.id)
  if (existingMembership) {
    // Already a member, just return the workspace
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, invite.workspaceId))
    return c.json({ ...workspace, role: existingMembership.role })
  }

  // Add user as member
  await db.insert(workspaceMembers).values({
    id: createId(),
    workspaceId: invite.workspaceId,
    userId: user.id,
    role: 'member',
    invitedBy: invite.createdBy,
  })

  // Increment usage count
  await db
    .update(workspaceInvites)
    .set({ usageCount: invite.usageCount + 1 })
    .where(eq(workspaceInvites.id, invite.id))

  // Return workspace details
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, invite.workspaceId))

  return c.json({ ...workspace, role: 'member' }, 201)
})

export default app
