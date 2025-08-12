import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  Plus,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const Dashboard = () => {
  const { session, loading, isAdmin } = useAuth();
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    if (session) {
      fetchSummary();
    }
  }, [session]);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch {
      // Failed to fetch summary
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Navigation />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-8'></div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`loading-skeleton-${Date.now()}-${i}`}
                  className='h-32 bg-gray-200 rounded'
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Navigation />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              Bienvenido al Sistema de Gestión Financiera
            </h1>
            <p className='text-xl text-gray-600 mb-8'>
              Inicia sesión para acceder a todas las funcionalidades
            </p>
            <Link href='/auth/signin'>
              <Button size='lg'>Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-600 mt-2'>
            {isAdmin
              ? 'Resumen general de tu sistema financiero'
              : 'Resumen de tus finanzas personales (solo lectura)'}
          </p>
        </div>

        {/* Tarjetas de resumen */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Ingresos Totales
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {formatCurrency(summary.income || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Gastos Totales
              </CardTitle>
              <TrendingDown className='h-4 w-4 text-red-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {formatCurrency(summary.expenses || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Balance</CardTitle>
              <DollarSign className='h-4 w-4 text-blue-600' />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${(summary.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatCurrency(summary.balance || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Usuarios
              </CardTitle>
              <Users className='h-4 w-4 text-purple-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {summary.totalUsers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
            <Link href='/transactions'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Plus className='h-5 w-5' />
                  <span>Gestionar Movimientos</span>
                </CardTitle>
                <CardDescription>
                  Agrega, edita y visualiza todos los ingresos y gastos
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          {isAdmin && (
            <>
              <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
                <Link href='/users'>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <Users className='h-5 w-5' />
                      <span>Gestionar Usuarios</span>
                    </CardTitle>
                    <CardDescription>
                      Administra usuarios y sus roles en el sistema
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
                <Link href='/reports'>
                  <CardHeader>
                    <CardTitle className='flex items-center space-x-2'>
                      <BarChart3 className='h-5 w-5' />
                      <span>Ver Reportes</span>
                    </CardTitle>
                    <CardDescription>
                      Analiza datos financieros y genera reportes
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
