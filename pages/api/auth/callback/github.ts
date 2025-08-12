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
    // Step 1: Exchange code for access token
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

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    const accessToken = tokenData.access_token;

    // Step 2: Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    if (!userData.id || !userData.login) {
      return res.status(400).json({ error: 'Invalid user data from GitHub' });
    }

    // Step 3: Get user emails (fallback if primary email not returned)
    let userEmail = userData.email;

    if (!userEmail) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const emailsData = await emailsResponse.json();
      const primaryEmail = emailsData.find(
        (email: { primary: boolean; email: string }) => email.primary
      );
      userEmail = primaryEmail
        ? primaryEmail.email
        : `${userData.login}@users.noreply.github.com`;
    }

    // Step 4: Create or update user in database
    const user = await prisma.user.upsert({
      where: { id: userData.id.toString() },
      update: {
        name: userData.name || userData.login,
        email: userEmail,
        image: userData.avatar_url,
        updatedAt: new Date(),
      },
      create: {
        id: userData.id.toString(),
        name: userData.name || userData.login,
        email: userEmail,
        image: userData.avatar_url,
        role: 'ADMIN', // Default to admin for testing
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Step 5: Create session
    const sessionToken = `session_${Date.now()}`;
    await prisma.session.create({
      data: {
        id: sessionToken,
        token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    // Step 6: Set session cookie and redirect
    res.setHeader(
      'Set-Cookie',
      `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    );

    // Redirect to dashboard
    res.redirect('/');
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
