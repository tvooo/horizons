import { createAuthClient } from 'better-auth/react'

// In production, use current origin; in development, use VITE_API_URL or localhost
const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return window.location.origin
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})

export const { signIn, signUp, signOut, useSession } = authClient
