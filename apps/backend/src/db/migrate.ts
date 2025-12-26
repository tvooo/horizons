import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

// Railway mounts persistent volumes at /data
const dbPath = process.env.NODE_ENV === 'production' ? '/data/horizons.db' : 'horizons.db'

const sqlite = new Database(dbPath)
const db = drizzle(sqlite)

migrate(db, { migrationsFolder: './drizzle' })

console.log('Migrations complete!')
sqlite.close()
