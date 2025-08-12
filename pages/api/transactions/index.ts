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

// Helper function to handle GET requests
const handleGetTransactions = async (
  session: { user: { role: string; id: string } },
  res: NextApiResponse
) => {
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
};

// Helper function to validate transaction data
const validateTransactionData = (data: Record<string, unknown>) => {
  const { concept, amount, type, date, userId } = data;
  const missingFields = [];

  if (!concept) missingFields.push('concept');
  if (!amount) missingFields.push('amount');
  if (!type) missingFields.push('type');
  if (!date) missingFields.push('date');
  if (!userId) missingFields.push('userId');

  if (missingFields.length > 0) {
    return {
      isValid: false,
      details: missingFields.reduce(
        (acc, field) => {
          acc[field] = 'Missing';
          return acc;
        },
        {} as Record<string, string>
      ),
    };
  }

  return { isValid: true, details: {} };
};

// Helper function to handle POST requests
const handlePostTransaction = async (
  session: { user: { role: string } },
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // Only admin users can create transactions
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden: Admin access required to create transactions',
    });
  }

  const validation = validateTransactionData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: validation.details,
    });
  }

  const { concept, amount, type, date, userId } = req.body;

  // Crear nueva transacción
  const newTransaction = await prisma.transaction.create({
    data: {
      concept: concept as string,
      amount: parseFloat(amount as string),
      type: type as 'INCOME' | 'EXPENSE',
      date: new Date((date as string) + 'T00:00:00'), // Ensure consistent timezone handling
      userId: userId as string,
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

    switch (method) {
      case 'GET':
        await handleGetTransactions(session, res);
        break;
      case 'POST':
        await handlePostTransaction(session, req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
