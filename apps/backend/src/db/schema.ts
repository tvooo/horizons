import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['area', 'project', 'list'] })
    .notNull()
    .default('list'),
  parentListId: integer('parent_list_id').references((): any => lists.id, { onDelete: 'set null' }),
  scheduledPeriodType: text('scheduled_period_type', {
    enum: ['day', 'week', 'month', 'quarter', 'year'],
  }),
  scheduledAnchorDate: integer('scheduled_anchor_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  listId: integer('list_id').references(() => lists.id, { onDelete: 'cascade' }),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  scheduledPeriodType: text('scheduled_period_type', {
    enum: ['day', 'week', 'month', 'quarter', 'year'],
  }),
  scheduledAnchorDate: integer('scheduled_anchor_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export type List = typeof lists.$inferSelect
export type NewList = typeof lists.$inferInsert
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
