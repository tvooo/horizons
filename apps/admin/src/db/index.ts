import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from '../../../backend/src/db/schema'

// Same database path as main backend
const dbPath = process.env.NODE_ENV === 'production' ? '/data/horizons.db' : 'horizons.db'

const sqlite = new Database(dbPath)
export const db = drizzle(sqlite, { schema })

// Re-export schema for convenience
export * from '../../../backend/src/db/schema'
