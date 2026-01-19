import { eq } from 'drizzle-orm'
import { db, users } from '../db'

const email = process.argv[2]

if (!email) {
  console.error('Usage: bun run make-admin <email>')
  process.exit(1)
}

const user = await db.select().from(users).where(eq(users.email, email)).get()

if (!user) {
  console.error(`User with email "${email}" not found.`)
  console.error('Make sure the user has signed up first via the main application.')
  process.exit(1)
}

if (user.isAdmin) {
  console.log(`User "${email}" is already an admin.`)
  process.exit(0)
}

await db.update(users).set({ isAdmin: true }).where(eq(users.id, user.id))

console.log(`Successfully promoted "${email}" to admin.`)
