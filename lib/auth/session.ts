import { NextApiRequest } from 'next';
import { parseCookies } from 'better-auth';
import { prisma } from './config';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface Session {
  user: SessionUser;
  expires: string;
}

export const getSessionFromRequest = async (
  req: NextApiRequest
): Promise<Session | null> => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = parseCookies(cookieHeader);
    const sessionToken = cookies.get('session');

    if (!sessionToken) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
    });

    if (!session || new Date() > session.expiresAt) {
      return null;
    }

    return {
      user: {
        ...session.user,
        image: session.user.image || undefined,
      },
      expires: session.expiresAt.toISOString(),
    };
  } catch {
    return null;
  }
};

export const isAuthenticated = async (
  req: NextApiRequest
): Promise<boolean> => {
  const session = await getSessionFromRequest(req);
  return !!session;
};

export const isAdmin = async (req: NextApiRequest): Promise<boolean> => {
  const session = await getSessionFromRequest(req);
  return session?.user?.role === 'ADMIN';
};

export const getCurrentUser = async (
  req: NextApiRequest
): Promise<SessionUser | null> => {
  const session = await getSessionFromRequest(req);
  return session?.user || null;
};
