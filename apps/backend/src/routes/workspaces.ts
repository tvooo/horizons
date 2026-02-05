import { randomBytes } from 'node:crypto'
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
  color: z.string().nullable().optional(),
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

// Helper to generate short random invite code using cryptographically secure random
function generateInviteCode(): string {
  return randomBytes(6).toString('base64url').slice(0, 8)
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

  // Only owners can update workspace
  if (membership.role !== 'owner') {
    return c.json({ error: 'Only owners can update workspace' }, 403)
  }

  const [workspace] = await db
    .update(workspaces)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workspaces.id, id))
    .returning()

  return c.json({ ...workspace, role: membership.role })
})

// DELETE /api/workspaces/:id - Delete workspace
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const user = getUser(c)

  const membership = await getMembership(id, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  // Only owners can delete workspace
  if (membership.role !== 'owner') {
    return c.json({ error: 'Only owners can delete workspace' }, 403)
  }

  // Can't delete personal workspaces
  const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id))
  if (workspace?.type === 'personal') {
    return c.json({ error: 'Cannot delete personal workspace' }, 400)
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
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, id))

  return c.json(members)
})

// DELETE /api/workspaces/:id/members/:userId - Remove member from workspace
app.delete('/:id/members/:userId', async (c) => {
  const id = c.req.param('id')
  const targetUserId = c.req.param('userId')
  const user = getUser(c)

  const membership = await getMembership(id, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  // Users can remove themselves, owners can remove anyone
  if (user.id !== targetUserId && membership.role !== 'owner') {
    return c.json({ error: 'Not authorized to remove this member' }, 403)
  }

  // Can't remove the last owner
  if (membership.role === 'owner') {
    const owners = await db
      .select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, id), eq(workspaceMembers.role, 'owner')))

    if (owners.length === 1 && owners[0].userId === targetUserId) {
      return c.json({ error: 'Cannot remove the last owner' }, 400)
    }
  }

  await db
    .delete(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, id), eq(workspaceMembers.userId, targetUserId)))

  return c.json({ success: true })
})

// GET /api/workspaces/:id/invites - Get workspace invites
app.get('/:id/invites', async (c) => {
  const id = c.req.param('id')
  const user = getUser(c)

  const membership = await getMembership(id, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  const invites = await db
    .select({
      id: workspaceInvites.id,
      code: workspaceInvites.code,
      createdAt: workspaceInvites.createdAt,
      expiresAt: workspaceInvites.expiresAt,
      usageLimit: workspaceInvites.usageLimit,
      usageCount: workspaceInvites.usageCount,
      createdByName: users.name,
    })
    .from(workspaceInvites)
    .innerJoin(users, eq(workspaceInvites.createdBy, users.id))
    .where(eq(workspaceInvites.workspaceId, id))

  return c.json(invites)
})

// POST /api/workspaces/:id/invites - Create workspace invite
app.post('/:id/invites', zValidator('json', createInviteSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')
  const user = getUser(c)

  const membership = await getMembership(id, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  // Only owners can create invites
  if (membership.role !== 'owner') {
    return c.json({ error: 'Only owners can create invites' }, 403)
  }

  const [invite] = await db
    .insert(workspaceInvites)
    .values({
      id: createId(),
      workspaceId: id,
      code: generateInviteCode(),
      createdBy: user.id,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      usageLimit: data.usageLimit ?? null,
    })
    .returning()

  return c.json(invite, 201)
})

// DELETE /api/workspaces/:id/invites/:inviteId - Delete workspace invite
app.delete('/:id/invites/:inviteId', async (c) => {
  const id = c.req.param('id')
  const inviteId = c.req.param('inviteId')
  const user = getUser(c)

  const membership = await getMembership(id, user.id)
  if (!membership) {
    return c.json({ error: 'Workspace not found' }, 404)
  }

  // Only owners can delete invites
  if (membership.role !== 'owner') {
    return c.json({ error: 'Only owners can delete invites' }, 403)
  }

  await db.delete(workspaceInvites).where(eq(workspaceInvites.id, inviteId))

  return c.json({ success: true })
})

// POST /api/workspaces/join/:code - Join workspace via invite code
app.post('/join/:code', async (c) => {
  const code = c.req.param('code')
  const user = getUser(c)

  const [invite] = await db.select().from(workspaceInvites).where(eq(workspaceInvites.code, code))

  if (!invite) {
    return c.json({ error: 'Invalid invite code' }, 404)
  }

  // Check if expired
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return c.json({ error: 'Invite has expired' }, 400)
  }

  // Check usage limit
  if (invite.usageLimit && invite.usageCount >= invite.usageLimit) {
    return c.json({ error: 'Invite has reached its usage limit' }, 400)
  }

  // Check if already a member
  const existingMembership = await getMembership(invite.workspaceId, user.id)
  if (existingMembership) {
    return c.json({ error: 'Already a member of this workspace' }, 400)
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

  // Get workspace details
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, invite.workspaceId))

  return c.json({ ...workspace, role: 'member' }, 201)
})

export default app
