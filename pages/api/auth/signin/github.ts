import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Redirect to GitHub OAuth with proper scopes
    // user:email scope is required to access user's email addresses
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_ID}&redirect_uri=${encodeURIComponent(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/github`)}&scope=user:email&state=${Date.now()}`;
    
    res.redirect(githubAuthUrl);
  } catch (error) {
    console.error('GitHub signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
