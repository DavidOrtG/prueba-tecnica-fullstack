import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/auth/config';
import { getSessionFromRequest } from '../../../lib/auth/session';

/**
 * @swagger
 * /api/summary:
 *   get:
 *     summary: Obtener resumen financiero
 *     description: |
 *       Obtiene un resumen de las finanzas del sistema.
 *       - **Admin users**: Ven el resumen de todas las transacciones del sistema
 *       - **Regular users**: Solo ven el resumen de sus propias transacciones
 *     tags: [Summary]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Resumen financiero obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialSummary'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       405:
 *         description: Método no permitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verificar autenticación
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Allow all authenticated users to view summaries (read-only)
    // Filter data based on user role
    let whereClause = {};
    
    // If not admin, only show user's own transactions
    if (session.user.role !== 'ADMIN') {
      whereClause = { userId: session.user.id };
    }

    const { method } = req;

    if (method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }

    // Obtain summary of transactions (filtered by user role)
    const [totalIncome, totalExpenses, totalUsers] = await Promise.all([
      prisma.transaction.aggregate({
        where: { 
          type: 'INCOME',
          ...whereClause
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { 
          type: 'EXPENSE',
          ...whereClause
        },
        _sum: { amount: true },
      }),
      // Total users count - admin sees all, regular users see 1 (themselves)
      session.user.role === 'ADMIN' 
        ? prisma.user.count()
        : Promise.resolve(1),
    ]);

    console.log('Summary calculation:', {
      totalIncome: totalIncome._sum.amount,
      totalExpenses: totalExpenses._sum.amount,
      totalUsers
    });

    const summary = {
      income: totalIncome._sum.amount || 0,
      expenses: totalExpenses._sum.amount || 0,
      balance: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
      totalUsers,
    };

    console.log('Final summary response:', summary);
    res.json(summary);
  } catch (error) {
    console.error('Summary API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
