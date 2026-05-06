import type { SessionOptions } from 'iron-session'

export interface SessionData {
  isLoggedIn?: boolean
  username?: string
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'viksphere-admin',
  ttl: 8 * 60 * 60, // 8 hours
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },
}
