import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionFromRequest } from '../../../lib/auth/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const [action, provider] = query.all as string[];

  try {
    switch (method) {
      case 'GET':
        if (action === 'signin' && provider === 'github') {
          // For better-auth v1.1.1, redirect to the OAuth flow
          // The actual OAuth will be handled by better-auth's built-in routes
          const redirectUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/signin/github`;
          res.redirect(redirectUrl);
        } else if (action === 'session') {
          // Get current session using our helper
          const session = await getSessionFromRequest(req);
          if (session) {
            res.json(session);
          } else {
            res.status(401).json({ error: 'No session found' });
          }
        } else if (action === 'signout') {
          // For better-auth v1.1.1, redirect to the signout route
          // The actual signout will be handled by better-auth
          res.redirect('/api/auth/signout');
        } else {
          res.status(404).json({ error: 'Route not found' });
        }
        break;

      case 'POST':
        if (action === 'signout') {
          // Signout handled by better-auth v1.1.1
          res.json({ success: true });
        } else {
          res.status(405).json({ error: 'Method not allowed' });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
