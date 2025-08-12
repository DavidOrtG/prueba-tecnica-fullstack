import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/auth/config';
import { getSessionFromRequest } from '@/lib/auth/session';

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Obtener transacciones
 *     description: |
 *       Obtiene la lista de transacciones financieras.
 *       - **Admin users**: Ven todas las transacciones del sistema
 *       - **Regular users**: Solo ven sus propias transacciones
 *     tags: [Transactions]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Lista de transacciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: No autenticado
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
 *   post:
 *     summary: Crear nueva transacción
 *     description: |
 *       Crea una nueva transacción financiera.
 *       **Solo usuarios administradores pueden crear transacciones.**
 *     tags: [Transactions]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - concept
 *               - amount
 *               - type
 *               - date
 *               - userId
 *             properties:
 *               concept:
 *                 type: string
 *                 description: Descripción o concepto de la transacción
 *                 example: "Salario mensual"
 *               amount:
 *                 type: number
 *                 description: Monto de la transacción
 *                 example: 2500000
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 description: Tipo de transacción
 *                 example: "INCOME"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la transacción
 *                 example: "2024-01-15"
 *               userId:
 *                 type: string
 *                 description: ID del usuario propietario de la transacción
 *                 example: "98815628"
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acceso denegado - Se requieren permisos de administrador
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

    switch (method) {
      case 'GET': {
        // GET: Filter transactions based on user role
        let whereClause = {};

        // If not admin, only show user's own transactions
        if (session.user.role !== 'ADMIN') {
          whereClause = { userId: session.user.id };
        }

        const transactions = await prisma.transaction.findMany({
          where: whereClause,
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
      }
      case 'POST': {
        // POST: Only admin users can create transactions
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            error: 'Forbidden: Admin access required to create transactions',
          });
        }

        const { concept, amount, type, date, userId } = req.body;

        // Validar datos
        if (!concept || !amount || !type || !date || !userId) {
          return res.status(400).json({
            error: 'Missing required fields',
            details: {
              concept: !concept ? 'Missing' : 'OK',
              amount: !amount ? 'Missing' : 'OK',
              type: !type ? 'Missing' : 'OK',
              date: !date ? 'Missing' : 'OK',
              userId: !userId ? 'Missing' : 'OK',
            },
          });
        }

        // Crear nueva transacción
        const newTransaction = await prisma.transaction.create({
          data: {
            concept,
            amount: parseFloat(amount),
            type,
            date: new Date(date + 'T00:00:00'), // Ensure consistent timezone handling
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

        res.status(201).json(newTransaction);
        break;
      }
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
