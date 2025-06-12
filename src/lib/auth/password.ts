import bcrypt from 'bcrypt';

// Hash a password
export async function hash(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Verify a password against a hash
export async function verify(hash: string, password: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
} 