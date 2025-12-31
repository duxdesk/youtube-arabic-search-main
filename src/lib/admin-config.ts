// Store hashed password (not plain text!)
// In production, use environment variables
export const ADMIN_CONFIG = {
  // You can change this password
  // In production, set this in .env file: VITE_ADMIN_PASSWORD="your_password"
  PASSWORD_HASH: import.meta.env.VITE_ADMIN_PASSWORD_HASH || 
    // Default hash for password "admin123"
    "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // SHA-256 hash of "admin123"
  
  // Session timeout (in milliseconds)
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  
  // Admin features
  PROTECTED_ROUTES: ['/manage', '/dashboard', '/settings'],
  
  // Allowed IPs (optional, for additional security)
  ALLOWED_IPS: ['127.0.0.1', 'localhost'] // Add your IPs here
};

// Helper to hash passwords (client-side hashing)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Verify password
export const verifyPassword = async (password: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === ADMIN_CONFIG.PASSWORD_HASH;
};
