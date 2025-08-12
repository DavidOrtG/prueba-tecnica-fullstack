import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const allRoutes = query.all as string[];

  if (!allRoutes || allRoutes.length === 0) {
    return res.status(404).json({ error: 'Route not found' });
  }

  const [action] = allRoutes;

  try {
    switch (method) {
      case 'GET': {
        // Only handle signin routes, not session
        if (action === 'signin' && allRoutes[1] === 'github') {
          res.redirect('/api/auth/signin/github');
        } else {
          res.status(404).json({ error: 'Route not found' });
        }
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
