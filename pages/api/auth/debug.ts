import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionFromRequest } from '@/lib/auth/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
      return res
        .status(403)
        .json({ error: 'Forbidden: Admin access required' });
    }

    res.json({
      message: 'Debug information retrieved successfully',
      data: {
        hasGithubId: !!process.env.GITHUB_ID,
        hasGithubSecret: !!process.env.GITHUB_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
