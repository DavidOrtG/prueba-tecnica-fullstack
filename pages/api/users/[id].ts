import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/auth/config';
import { getSessionFromRequest } from '@/lib/auth/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verificar autenticación
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { method } = req;
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    switch (method) {
      case 'GET': {
        // GET: Allow users to view their own profile, or admins to view any
        const user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Check if user can view this profile
        if (session.user.role !== 'ADMIN' && user.id !== session.user.id) {
          return res
            .status(403)
            .json({ error: 'Forbidden: You can only view your own profile' });
        }

        res.json(user);
        break;
      }
      case 'PUT': {
        // PUT: Only admin users can modify users
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            error: 'Forbidden: Admin access required to modify users',
          });
        }

        const { name, role } = req.body;

        if (!name || !role) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            name,
            role,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        res.json(updatedUser);
        break;
      }
      case 'DELETE': {
        // DELETE: Only admin users can delete users
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            error: 'Forbidden: Admin access required to delete users',
          });
        }

        await prisma.user.delete({
          where: { id },
        });
        res.json({ message: 'User deleted successfully' });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
