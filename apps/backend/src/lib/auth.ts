import { expo } from '@better-auth/expo'
import { createId } from '@paralleldrive/cuid2'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import * as schema from '../db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create a personal workspace for the new user
          const workspaceId = createId()
          await db.insert(schema.workspaces).values({
            id: workspaceId,
            name: 'Personal',
            type: 'personal',
          })
          await db.insert(schema.workspaceMembers).values({
            id: createId(),
            workspaceId,
            userId: user.id,
            role: 'owner',
          })
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production with email service
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (refresh session if older than 1 day)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'exp://*', // For Expo development
    'horizons://*', // For production app
  ],
  plugins: [expo()],
  // Add more providers here (Google, GitHub, etc.) as needed
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  // },
})

export type Session = typeof auth.$Infer.Session
