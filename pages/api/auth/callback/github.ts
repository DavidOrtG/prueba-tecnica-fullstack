import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/auth/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('GitHub OAuth callback started');
    console.log('Query params:', query);
    
    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    const { code, state } = query;

    if (!code || typeof code !== 'string') {
      console.error('Missing or invalid authorization code');
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    console.log('Authorization code received, exchanging for token...');

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_ID,
        client_secret: process.env.GITHUB_SECRET,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/github`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenResponse.status, tokenResponse.statusText);
      return res.status(400).json({ error: 'Failed to exchange code for token' });
    }

    const tokenData = await tokenResponse.json();
    console.log('Token response received:', { ...tokenData, access_token: tokenData.access_token ? '[REDACTED]' : 'undefined' });
    
    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData);
      return res.status(400).json({ error: `OAuth error: ${tokenData.error_description || tokenData.error}` });
    }

    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData);
      return res.status(400).json({ error: 'No access token received from GitHub' });
    }

    const accessToken = tokenData.access_token;
    console.log('Access token received, fetching user data...');

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user data:', userResponse.status, userResponse.statusText);
      return res.status(400).json({ error: 'Failed to fetch user data from GitHub' });
    }

    const userData = await userResponse.json();
    console.log('User data received:', { id: userData.id, login: userData.login, name: userData.name, email: userData.email ? '[REDACTED]' : 'undefined' });

    if (!userData.id) {
      console.error('Invalid user data from GitHub:', userData);
      return res.status(400).json({ error: 'Invalid user ID from GitHub' });
    }

    // Try to get user's email from GitHub emails endpoint
    let userEmail = userData.email;
    console.log('Initial email from user data:', userEmail ? '[REDACTED]' : 'undefined');
    
    if (!userEmail) {
      console.log('No email in user data, trying emails endpoint...');
      try {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (emailsResponse.ok) {
          const emails = await emailsResponse.json();
          console.log('Emails endpoint response:', emails.map((e: any) => ({ email: e.email ? '[REDACTED]' : 'undefined', primary: e.primary })));
          const primaryEmail = emails.find((email: any) => email.primary);
          userEmail = primaryEmail ? primaryEmail.email : emails[0]?.email;
          console.log('Email from emails endpoint:', userEmail ? '[REDACTED]' : 'undefined');
        } else {
          console.error('Emails endpoint failed:', emailsResponse.status, emailsResponse.statusText);
        }
      } catch (emailError) {
        console.error('Error fetching emails:', emailError);
      }
    }

    // If still no email, create a placeholder email using GitHub username
    if (!userEmail) {
      userEmail = `${userData.login}@users.noreply.github.com`;
      console.log('No email found, using placeholder:', userEmail);
    }

    console.log('Final email to use:', userEmail ? '[REDACTED]' : 'undefined');

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.log('Creating new user...');
      // Create new user with ADMIN role
      user = await prisma.user.create({
        data: {
          id: userData.id.toString(),
          name: userData.name || userData.login,
          email: userEmail,
          emailVerified: true,
          image: userData.avatar_url || null,
          role: 'ADMIN',
        },
      });
      console.log('New user created with ID:', user.id);
    } else {
      console.log('User already exists with ID:', user.id);
    }

    console.log('Creating session...');
    // Create session
    const session = await prisma.session.create({
      data: {
        id: `session_${Date.now()}`,
        token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Session created with token:', session.token.substring(0, 20) + '...');

    // Set session cookie
    res.setHeader('Set-Cookie', [
      `better-auth.session-token=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
    ]);

    console.log('Session cookie set, redirecting to dashboard...');
    
    // Redirect to dashboard
    res.redirect('/');
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
