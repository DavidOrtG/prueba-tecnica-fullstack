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

    // Create a test user if it doesn't exist
    let user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'test-user-123',
          name: 'Test User',
          email: 'test@example.com',
          emailVerified: true,
          role: 'ADMIN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Create a test session
    const session = await prisma.session.create({
      data: {
        id: `test-session-${Date.now()}`,
        token: `test-token-${Date.now()}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ipAddress:
          (req.headers['x-forwarded-for'] as string) ||
          req.socket.remoteAddress ||
          'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Set the session cookie
    const cookieValue = `session=${session.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;
    res.setHeader('Set-Cookie', cookieValue);

    res.json({
      success: true,
      message: 'Test session created',
      sessionId: session.id,
      userId: user.id,
      cookieSet: cookieValue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await prisma.$disconnect();
  }
}
