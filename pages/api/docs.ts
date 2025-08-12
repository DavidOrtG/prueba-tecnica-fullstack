import { NextApiRequest, NextApiResponse } from 'next';
import swaggerJsdoc from 'swagger-jsdoc';
import { getSessionFromRequest } from '../../lib/auth/session';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prueba Técnica Fullstack API',
      version: '1.0.0',
      description: 'API para sistema de gestión financiera con autenticación y control de acceso basado en roles',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-app.vercel.app' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session',
          description: 'Session token stored in cookies',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '98815628' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            emailVerified: { type: 'boolean', example: true },
            image: { type: 'string', example: 'https://github.com/octocat.png' },
            role: { type: 'string', enum: ['ADMIN', 'USER'], example: 'ADMIN' },
            phone: { type: 'string', example: '+1234567890' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'email', 'role'],
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'transaction_123' },
            concept: { type: 'string', example: 'Salario mensual' },
            amount: { type: 'number', example: 2500000 },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'INCOME' },
            date: { type: 'string', format: 'date-time' },
            userId: { type: 'string', example: '98815628' },
            user: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'concept', 'amount', 'type', 'date', 'userId'],
        },
        FinancialSummary: {
          type: 'object',
          properties: {
            income: { type: 'number', example: 5000000 },
            expenses: { type: 'number', example: 2000000 },
            balance: { type: 'number', example: 3000000 },
            totalUsers: { type: 'number', example: 5 },
          },
          required: ['income', 'expenses', 'balance', 'totalUsers'],
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Unauthorized' },
            details: { type: 'object', example: { field: 'Missing required field' } },
          },
          required: ['error'],
        },
      },
    },
    security: [{ sessionAuth: [] }],
  },
  apis: ['./pages/api/**/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Verificar autenticación
    const session = await getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Solo administradores pueden acceder a la documentación de la API
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required to view API documentation' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(specs);
  } catch (error) {
    console.error('API docs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
