import { NextApiRequest } from 'next';
import { prisma } from './config';
import { getCookies, parseCookies } from 'better-auth';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'USER' | 'ADMIN';
  phone?: string | null;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

/**
 * Extract session information from Next.js API request
 * This is a workaround since better-auth v1.1.1 doesn't have direct session methods
 * for Next.js API routes
 */
export async function getSessionFromRequest(req: NextApiRequest): Promise<Session | null> {
  try {
    // Get cookies from the request
    const cookieHeader = req.headers.cookie || '';
    const cookies = parseCookies(cookieHeader);
    
    // Get the session token from cookies
    const sessionToken = cookies.get('better-auth.session-token') || cookies.get('session-token');
    
    if (!sessionToken) {
      return null;
    }

    // Find the session in the database
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: true,
      },
    });

    if (!session || !session.user) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      return null;
    }

    // Return the session with user information
    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
        phone: session.user.phone,
      },
      expires: session.expiresAt.toISOString(),
    };
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(req: NextApiRequest): Promise<boolean> {
  const session = await getSessionFromRequest(req);
  return session !== null;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(req: NextApiRequest): Promise<boolean> {
  const session = await getSessionFromRequest(req);
  return session?.user.role === 'ADMIN';
}

/**
 * Get current user from request
 */
export async function getCurrentUser(req: NextApiRequest): Promise<SessionUser | null> {
  const session = await getSessionFromRequest(req);
  return session?.user || null;
}
