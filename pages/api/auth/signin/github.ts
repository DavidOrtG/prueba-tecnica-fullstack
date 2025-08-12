import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the base URL from environment
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Redirect to GitHub OAuth with proper scopes
    // user:email scope is required to access user's email addresses
    const redirectUri = `${baseUrl}/api/auth/callback/github`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_ID}&redirect_uri=${redirectUri}&scope=user:email`;

    res.redirect(githubAuthUrl);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
