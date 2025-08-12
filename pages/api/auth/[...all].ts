import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionFromRequest } from '@/lib/auth/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const [action] = query.all as string[];

  try {
    switch (method) {
      case 'GET': {
        // Check if user is authenticated
        const session = await getSessionFromRequest(req);
        if (!session) {
          res.redirect('/api/auth/signin/github');
          break;
        }
        res.redirect('/api/auth/signin/github');
        break;
      }

      case 'POST': {
        if (action === 'signout') {
          res.redirect('/api/auth/signout');
        } else {
          res.status(404).json({ error: 'Route not found' });
        }
        break;
      }

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
