import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'

// Railway mounts persistent volumes at /data
const dbPath = process.env.NODE_ENV === 'production' ? '/data/horizons.db' : 'horizons.db'

const sqlite = new Database(dbPath)
export const db = drizzle(sqlite, { schema })
