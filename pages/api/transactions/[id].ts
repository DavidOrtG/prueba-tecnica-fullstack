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
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }

    switch (method) {
      case 'PUT':
        const { concept, amount, type, date } = req.body;

        // Validar datos
        if (!concept || !amount || !type || !date) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verificar que la transacción existe
        const existingTransaction = await prisma.transaction.findUnique({
          where: { id },
        });

        if (!existingTransaction) {
          return res.status(404).json({ error: 'Transaction not found' });
        }

        // Actualizar transacción
        const updatedTransaction = await prisma.transaction.update({
          where: { id },
          data: {
            concept,
            amount: parseFloat(amount),
            type,
            date: new Date(date),
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
        break;

      case 'DELETE':
        // Verificar que la transacción existe
        const transactionToDelete = await prisma.transaction.findUnique({
          where: { id },
        });

        if (!transactionToDelete) {
          return res.status(404).json({ error: 'Transaction not found' });
        }

        // Eliminar transacción
        await prisma.transaction.delete({
          where: { id },
        });

        res.json({ success: true });
        break;

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Transaction API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
