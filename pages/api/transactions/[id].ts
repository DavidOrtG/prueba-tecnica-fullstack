import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/auth/config';
import { getSessionFromRequest } from '@/lib/auth/session';

// Helper function to handle GET requests
const handleGetTransaction = async (
  id: string,
  session: { user: { role: string; id: string } },
  res: NextApiResponse
) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  // Check if user can view this transaction
  if (session.user.role !== 'ADMIN' && transaction.userId !== session.user.id) {
    return res.status(403).json({
      error: 'Forbidden: You can only view your own transactions',
    });
  }

  res.json(transaction);
};

// Helper function to handle PUT requests
const handlePutTransaction = async (
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { concept, amount, type, date } = req.body;

  if (!concept || !amount || !type || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const updatedTransaction = await prisma.transaction.update({
    where: { id },
    data: {
      concept: concept as string,
      amount: parseFloat(amount as string),
      type: type as 'INCOME' | 'EXPENSE',
      date: new Date((date as string) + 'T00:00:00'), // Ensure consistent timezone handling
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  res.json(updatedTransaction);
};

// Helper function to handle DELETE requests
const handleDeleteTransaction = async (id: string, res: NextApiResponse) => {
  await prisma.transaction.delete({
    where: { id },
  });
  res.json({ message: 'Transaction deleted successfully' });
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
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }

    switch (method) {
      case 'GET':
        await handleGetTransaction(id, session, res);
        break;
      case 'PUT':
        // Only admin users can modify transactions
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            error: 'Forbidden: Admin access required to modify transactions',
          });
        }
        await handlePutTransaction(id, req, res);
        break;
      case 'DELETE':
        // Only admin users can delete transactions
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            error: 'Forbidden: Admin access required to delete transactions',
          });
        }
        await handleDeleteTransaction(id, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
