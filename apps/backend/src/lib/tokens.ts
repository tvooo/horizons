import { createId } from '@paralleldrive/cuid2'

// Token format: hzn_<32 random chars>
export function generateApiToken(): string {
  const randomPart = createId() + createId()
  return `hzn_${randomPart.slice(0, 32)}`
}

export function getTokenPrefix(token: string): string {
  return token.slice(0, 12)
}

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
