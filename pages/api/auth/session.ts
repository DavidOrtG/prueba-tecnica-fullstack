import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/auth/config';

// Helper function to find session
const findSession = async (sessionToken: string) =>
  await prisma.session.findUnique({
    where: { id: sessionToken },
    include: { user: true },
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session from cookie
    const sessionToken = req.cookies.session;

    if (!sessionToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Find session in database
    const session = await findSession(sessionToken);

    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    // Return session data as JSON
    res.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        image: session.user.image,
      },
      expires: session.expiresAt.toISOString(),
    });
  } catch (error) {
    // If it's a database-related error, return 401 instead of 500
    if (
      error instanceof Error &&
      (error.message.includes('database') ||
        error.message.includes('connection') ||
        error.message.includes('timeout'))
    ) {
      return res.status(401).json({
        error: 'Authentication service unavailable',
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
