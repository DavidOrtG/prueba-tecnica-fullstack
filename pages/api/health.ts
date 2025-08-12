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
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      GITHUB_ID: !!process.env.GITHUB_ID,
      GITHUB_SECRET: !!process.env.GITHUB_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
    };

    // Check database connection
    let dbStatus = 'unknown';
    try {
      await prisma.$connect();
      dbStatus = 'connected';
      await prisma.$disconnect();
    } catch (error) {
      dbStatus = 'error';
      console.error('Database connection error:', error);
    }

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbStatus,
      uptime: process.uptime(),
    };

    res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Health check failed',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
}
