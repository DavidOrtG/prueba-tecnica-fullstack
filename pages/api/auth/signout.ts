import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/auth/config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session token from cookies
    const cookieHeader = req.headers.cookie || '';
    const sessionToken = cookieHeader
      .split(';')
      .find((cookie) => cookie.trim().startsWith('better-auth.session-token='))
      ?.split('=')[1];

    if (sessionToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { token: sessionToken },
      });
    }

    // Clear session cookie
    res.setHeader('Set-Cookie', [
      'better-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ]);

    if (req.method === 'GET') {
      res.redirect('/');
    } else {
      res.json({ message: 'Signed out successfully' });
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
