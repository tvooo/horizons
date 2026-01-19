import { Database } from 'bun:sqlite'
import { join } from 'node:path'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from 'shared/db/schema'

// Use the same database as the backend
const dbPath =
  process.env.NODE_ENV === 'production'
    ? '/data/horizons.db'
    : join(import.meta.dir, '../../../backend/horizons.db')

const sqlite = new Database(dbPath)
export const db = drizzle(sqlite, { schema })

// Re-export schema for convenience
export * from 'shared/db/schema'
