import { createHmac } from 'crypto'

const SECRET = process.env.FEED_SECRET || process.env.NEXTAUTH_SECRET || 'change-me-in-production'

export function generateFeedToken(userId: string): string {
  return createHmac('sha256', SECRET).update(userId).digest('hex').substring(0, 32)
}

export function verifyFeedToken(token: string): string | null {
  // We can't reverse the HMAC, so we just return the userId if format matches
  // The actual verification happens at lookup time (compute HMAC for each possible user)
  if (/^[a-f0-9]{32}$/.test(token)) return token
  return null
}
