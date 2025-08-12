import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/auth/config';
import { getSessionFromRequest } from '@/lib/auth/session';

// Helper function to handle GET requests
const handleGetUser = async (
  id: string,
  session: { user: { role: string; id: string } },
  res: NextApiResponse
) => {
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
};

// Helper function to handle PUT requests
const handlePutUser = async (
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: name as string,
      role: role as 'USER' | 'ADMIN',
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
};

// Helper function to handle DELETE requests
const handleDeleteUser = async (id: string, res: NextApiResponse) => {
  await prisma.user.delete({
    where: { id },
  });
  res.json({ message: 'User deleted successfully' });
};

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
      case 'GET':
        await handleGetUser(id, session, res);
        break;
      case 'PUT':
        // Only admin users can modify users
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            error: 'Forbidden: Admin access required to modify users',
          });
        }
        await handlePutUser(id, req, res);
        break;
      case 'DELETE':
        // Only admin users can delete users
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            error: 'Forbidden: Admin access required to delete users',
          });
        }
        await handleDeleteUser(id, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
