import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/auth/config';
import { getSessionFromRequest } from '../../../lib/auth/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar autenticación
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verificar que sea admin
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { method } = req;
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    switch (method) {
      case 'PUT':
        const { name, role } = req.body;

        // Validar datos
        if (!name || !role) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verificar que el usuario existe
        const existingUser = await prisma.user.findUnique({
          where: { id },
        });

        if (!existingUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Actualizar usuario
        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            name,
            role,
          },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            role: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        res.json(updatedUser);
        break;

      case 'DELETE':
        // Verificar que el usuario existe
        const userToDelete = await prisma.user.findUnique({
          where: { id },
        });

        if (!userToDelete) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Eliminar usuario
        await prisma.user.delete({
          where: { id },
        });

        res.json({ success: true });
        break;

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
