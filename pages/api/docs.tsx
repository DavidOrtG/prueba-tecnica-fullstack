import { NextPage } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Code, Database, Shield, Users, TrendingUp, FileText } from 'lucide-react';

const ApiDocs: NextPage = () => {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/auth/session',
      description: 'Obtener la sesión actual del usuario',
      auth: true,
      admin: false,
      response: {
        success: true,
        data: {
          user: {
            id: 'string',
            name: 'string',
            email: 'string',
            role: 'USER | ADMIN',
          },
          expires: 'string',
        },
      },
    },
    {
      method: 'GET',
      path: '/api/auth/signin/github',
      description: 'Iniciar sesión con GitHub OAuth',
      auth: false,
      admin: false,
      response: 'Redirect to GitHub OAuth',
    },
    {
      method: 'POST',
      path: '/api/auth/signout',
      description: 'Cerrar sesión del usuario',
      auth: true,
      admin: false,
      response: { success: true },
    },
    {
      method: 'GET',
      path: '/api/transactions',
      description: 'Obtener todas las transacciones',
      auth: true,
      admin: false,
      response: [
        {
          id: 'string',
          concept: 'string',
          amount: 'number',
          type: 'INCOME | EXPENSE',
          date: 'Date',
          user: {
            id: 'string',
            name: 'string',
            email: 'string',
            role: 'USER | ADMIN',
          },
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/transactions',
      description: 'Crear una nueva transacción',
      auth: true,
      admin: true,
      body: {
        concept: 'string',
        amount: 'number',
        type: 'INCOME | EXPENSE',
        date: 'string (YYYY-MM-DD)',
      },
      response: 'Transaction object',
    },
    {
      method: 'PUT',
      path: '/api/transactions/[id]',
      description: 'Actualizar una transacción existente',
      auth: true,
      admin: true,
      body: {
        concept: 'string',
        amount: 'number',
        type: 'INCOME | EXPENSE',
        date: 'string (YYYY-MM-DD)',
      },
      response: 'Updated transaction object',
    },
    {
      method: 'DELETE',
      path: '/api/transactions/[id]',
      description: 'Eliminar una transacción',
      auth: true,
      admin: true,
      response: { success: true },
    },
    {
      method: 'GET',
      path: '/api/users',
      description: 'Obtener todos los usuarios',
      auth: true,
      admin: true,
      response: [
        {
          id: 'string',
          name: 'string',
          email: 'string',
          role: 'USER | ADMIN',
          phone: 'string | null',
          image: 'string | null',
          createdAt: 'Date',
          updatedAt: 'Date',
        },
      ],
    },
    {
      method: 'PUT',
      path: '/api/users/[id]',
      description: 'Actualizar un usuario existente',
      auth: true,
      admin: true,
      body: {
        name: 'string',
        role: 'USER | ADMIN',
      },
      response: 'Updated user object',
    },
    {
      method: 'GET',
      path: '/api/summary',
      description: 'Obtener resumen del dashboard',
      auth: true,
      admin: false,
      response: {
        totalIncome: 'number',
        totalExpenses: 'number',
        balance: 'number',
        totalUsers: 'number',
        totalTransactions: 'number',
      },
    },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Documentación de la API
          </h1>
          <p className="text-xl text-gray-600">
            Sistema de Gestión Financiera - Endpoints y Especificaciones
          </p>
        </div>

        {/* Información general */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-6 w-6" />
              <span>Información General</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Autenticación requerida para la mayoría de endpoints</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm">Control de acceso basado en roles (RBAC)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Base de datos PostgreSQL con Prisma ORM</span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Base URL:</strong> {process.env.NEXTAUTH_URL || 'http://localhost:3000'}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <strong>Formato de respuesta:</strong> JSON
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Endpoints Disponibles</h2>
          
          {endpoints.map((endpoint, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                  <div className="flex space-x-2">
                    {endpoint.auth && (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Auth
                      </Badge>
                    )}
                    {endpoint.admin && (
                      <Badge variant="destructive">
                        <Users className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-base">
                  {endpoint.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {endpoint.body && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Body (JSON)</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(endpoint.body, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Respuesta</h4>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {typeof endpoint.response === 'string' 
                        ? endpoint.response 
                        : JSON.stringify(endpoint.response, null, 2)
                      }
                    </pre>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Rate Limit: No aplica</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>Content-Type: application/json</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Códigos de estado */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Códigos de Estado HTTP</CardTitle>
            <CardDescription>
              Códigos de respuesta estándar utilizados por la API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">200</Badge>
                  <span className="text-sm">OK - Solicitud exitosa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">201</Badge>
                  <span className="text-sm">Created - Recurso creado exitosamente</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-800">400</Badge>
                  <span className="text-sm">Bad Request - Datos inválidos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-800">401</Badge>
                  <span className="text-sm">Unauthorized - No autenticado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-800">403</Badge>
                  <span className="text-sm">Forbidden - Sin permisos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-800">500</Badge>
                  <span className="text-sm">Internal Server Error - Error del servidor</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiDocs;
