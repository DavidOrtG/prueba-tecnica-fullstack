import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionFromRequest } from '../../../lib/auth/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar autenticación
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Solo administradores pueden acceder al debug
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // This endpoint helps debug OAuth issues (ADMIN ONLY)
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        GITHUB_ID: process.env.GITHUB_ID ? 'Set' : 'Not set',
        GITHUB_SECRET: process.env.GITHUB_SECRET ? 'Set' : 'Not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      },
      oauth: {
        signinUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/signin/github`,
        callbackUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/github`,
      },
      message: 'Debug endpoint working. Check console logs for OAuth flow details.',
    };

    res.json(debugInfo);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
