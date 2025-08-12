import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/auth/config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    await prisma.$connect();

    // Check if we can query the database
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.session.count();

    // Check environment variables (without exposing sensitive data)
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      GITHUB_ID: process.env.GITHUB_ID ? 'SET' : 'NOT SET',
      GITHUB_SECRET: process.env.GITHUB_SECRET ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    };

    res.json({
      status: 'ok',
      database: {
        connected: true,
        userCount,
        sessionCount,
      },
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
}
