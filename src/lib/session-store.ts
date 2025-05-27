import { randomBytes } from 'crypto';

interface SessionData {
  email: string;
  password: string;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();

const EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export function createSession(email: string, password: string): string {
  // Clean up expired sessions
  cleanupExpiredSessions();

  // Generate a secure random token
  const token = randomBytes(32).toString('hex');
  
  // Store the session data
  sessions.set(token, {
    email,
    password,
    expiresAt: Date.now() + EXPIRY_TIME
  });

  return token;
}

export function getSession(token: string): SessionData | null {
  const session = sessions.get(token);
  
  if (!session) {
    return null;
  }

  // Check if session has expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
} 