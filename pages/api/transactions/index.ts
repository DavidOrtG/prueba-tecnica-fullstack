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

    switch (method) {
      case 'GET':
        // Obtener todas las transacciones
        const transactions = await prisma.transaction.findMany({
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
          orderBy: {
            createdAt: 'desc',
          },
        });

        res.json(transactions);
        break;

      case 'POST':
        const { concept, amount, type, date, userId } = req.body;
        
        console.log('Received transaction data:', { concept, amount, type, date, userId });

        // Validar datos
        if (!concept || !amount || !type || !date || !userId) {
          console.log('Validation failed - missing fields:', { 
            hasConcept: !!concept, 
            hasAmount: !!amount, 
            hasType: !!type, 
            hasDate: !!date, 
            hasUserId: !!userId 
          });
          return res.status(400).json({ 
            error: 'Missing required fields',
            details: {
              concept: !concept ? 'Missing' : 'OK',
              amount: !amount ? 'Missing' : 'OK',
              type: !type ? 'Missing' : 'OK',
              date: !date ? 'Missing' : 'OK',
              userId: !userId ? 'Missing' : 'OK'
            }
          });
        }

        console.log('Creating transaction with data:', { concept, amount, type, date, userId });

        // Crear nueva transacción
        const newTransaction = await prisma.transaction.create({
          data: {
            concept,
            amount: parseFloat(amount),
            type,
            date: new Date(date),
            userId,
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

        console.log('Transaction created successfully:', newTransaction.id);
        res.status(201).json(newTransaction);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Transactions API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
