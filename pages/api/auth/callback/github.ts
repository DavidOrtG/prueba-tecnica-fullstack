import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/auth/config';

/**
 * @swagger
 * /api/auth/callback/github:
 *   get:
 *     summary: Callback de autenticación GitHub
 *     description: |
 *       Maneja el callback de OAuth de GitHub después de la autorización.
 *       Este endpoint:
 *       1. Intercambia el código de autorización por un token de acceso
 *       2. Obtiene la información del usuario desde GitHub
 *       3. Crea o actualiza el usuario en la base de datos
 *       4. Crea una sesión y establece la cookie de sesión
 *       5. Redirige al dashboard
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de autorización de GitHub
 *       - in: query
 *         name: state
 *         required: false
 *         schema:
 *           type: string
 *         description: Estado de la solicitud OAuth
 *     responses:
 *       302:
 *         description: Redirección exitosa al dashboard
 *         headers:
 *           Set-Cookie:
 *             description: Cookie de sesión establecida
 *             schema:
 *               type: string
 *       400:
 *         description: Código de autorización inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor durante la autenticación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Helper function to validate environment variables
const validateEnvironment = (): void => {
  if (
    !process.env.GITHUB_ID ||
    !process.env.GITHUB_SECRET ||
    !process.env.DATABASE_URL
  ) {
    throw new Error('Missing required environment variables');
  }
};

// Helper function to test database connection
const testDatabaseConnection = async (): Promise<void> => {
  try {
    await prisma.$connect();
  } catch (dbError) {
    throw new Error(
      `Database connection failed: ${(dbError as Error).message}`
    );
  }
};

// Helper function to exchange code for access token
const exchangeCodeForToken = async (code: string): Promise<string> => {
  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_ID,
        client_secret: process.env.GITHUB_SECRET,
        code,
      }),
    }
  );

  if (!tokenResponse.ok) {
    throw new Error(
      `Failed to get access token from GitHub: ${tokenResponse.status}`
    );
  }

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    throw new Error(
      `GitHub error: ${tokenData.error_description || tokenData.error}`
    );
  }

  const accessToken = tokenData.access_token;

  if (!accessToken) {
    throw new Error('No access token received from GitHub');
  }

  return accessToken;
};

// Helper function to get user data from GitHub
const getUserData = async (
  accessToken: string
): Promise<Record<string, unknown>> => {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!userResponse.ok) {
    throw new Error(
      `Failed to get user data from GitHub: ${userResponse.status}`
    );
  }

  const userData = await userResponse.json();

  if (!userData.id || !userData.login) {
    throw new Error('Invalid user data from GitHub');
  }

  return userData;
};

// Helper function to get user email
const getUserEmail = async (
  accessToken: string,
  userData: Record<string, unknown>
): Promise<string> => {
  let userEmail = userData.email as string;

  if (!userEmail) {
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (emailsResponse.ok) {
      const emailsData = await emailsResponse.json();
      const primaryEmail = emailsData.find(
        (email: { primary: boolean; email: string }) => email.primary
      );
      userEmail = primaryEmail
        ? primaryEmail.email
        : `${userData.login}@users.noreply.github.com`;
    } else {
      userEmail = `${userData.login}@users.noreply.github.com`;
    }
  }

  return userEmail;
};

// Helper function to create or update user
const createOrUpdateUser = async (
  userData: Record<string, unknown>,
  userEmail: string
) => {
  const userId = userData.id as string | number;
  return await prisma.user.upsert({
    where: { id: userId.toString() },
    update: {
      name: (userData.name as string) || (userData.login as string),
      email: userEmail,
      image: userData.avatar_url as string,
      updatedAt: new Date(),
    },
    create: {
      id: userId.toString(),
      name: (userData.name as string) || (userData.login as string),
      email: userEmail,
      image: userData.avatar_url as string,
      role: 'ADMIN', // Default to admin for testing
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
};

// Helper function to create session
const createSession = async (userId: string, req: NextApiRequest) => {
  const sessionToken = `session_${Date.now()}`;
  return await prisma.session.create({
    data: {
      id: sessionToken,
      token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
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
};

// Helper function to handle database connection test
const testDatabaseConnectionWithErrorHandling = async () => {
  try {
    await testDatabaseConnection();
    return { success: true };
  } catch (dbError) {
    return { success: false, error: dbError };
  }
};

// Helper function to handle database operations
const handleDatabaseOperations = async (
  userData: Record<string, unknown>,
  userEmail: string,
  req: NextApiRequest
) => {
  const user = await createOrUpdateUser(userData, userEmail);
  await createSession(user.id, req);
  return user;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    // Validate environment variables
    validateEnvironment();

    // Test database connection first
    const dbTest = await testDatabaseConnectionWithErrorHandling();
    if (!dbTest.success) {
      return res.status(500).json({
        error: 'Authentication service unavailable',
        details:
          process.env.NODE_ENV === 'development'
            ? 'Database connection failed'
            : undefined,
      });
    }

    // Step 1: Exchange code for access token
    const accessToken = await exchangeCodeForToken(code);

    // Step 2: Get user info from GitHub
    const userData = await getUserData(accessToken);

    // Step 3: Get user email
    const userEmail = await getUserEmail(accessToken, userData);

    // Step 4: Create or update user in database
    try {
      const user = await handleDatabaseOperations(userData, userEmail, req);

      // Step 6: Set session cookie and redirect
      res.setHeader(
        'Set-Cookie',
        `session=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
          30 * 24 * 60 * 60
        }`
      );

      // Redirect to dashboard
      res.redirect('/');
    } catch (dbOpError) {
      return res.status(500).json({
        error: 'Authentication failed',
        details:
          process.env.NODE_ENV === 'development'
            ? (dbOpError as Error).message
            : undefined,
      });
    } finally {
      // Always disconnect from database
      try {
        await prisma.$disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error during authentication',
      details:
        process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : undefined,
    });
  }
}
