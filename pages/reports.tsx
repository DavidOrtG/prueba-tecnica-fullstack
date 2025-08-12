import { useEffect, useState, useCallback } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/types';
import {
  formatCurrency,
  exportToCSV,
  safeParseDate,
  formatDateForExport,
  toDateInputValue,
} from '@/lib/utils';
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Reports = () => {
  const { session, loading, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    totalTransactions: 0,
  });

  const fetchTransactions = useCallback(async () => {
    const response = await fetch('/api/transactions');
    if (response.ok) {
      const data = await response.json();
      setTransactions(data);
      calculateSummary(data);
    }
  }, []);

  useEffect(() => {
    if (session && isAdmin) {
      fetchTransactions();
    }
  }, [session, isAdmin, fetchTransactions]);

  const calculateSummary = (data: Transaction[]) => {
    const totalIncome = data
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = data
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    setSummary({
      totalIncome,
      totalExpenses,
      balance,
      totalTransactions: data.length,
    });
  };

  const prepareChartData = () => {
    const monthlyData = transactions.reduce(
      (acc, transaction) => {
        const date = safeParseDate(transaction.date);

        // Skip transactions with invalid dates
        if (!date) {
          return acc;
        }

        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!acc[monthYear]) {
          acc[monthYear] = { month: monthYear, income: 0, expenses: 0 };
        }

        if (transaction.type === 'INCOME') {
          acc[monthYear].income += transaction.amount;
        } else {
          acc[monthYear].expenses += transaction.amount;
        }

        return acc;
      },
      {} as Record<string, { month: string; income: number; expenses: number }>
    );

    return Object.values(monthlyData).slice(-6); // Últimos 6 meses
  };

  const preparePieData = () => {
    const incomeCategories = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce(
        (acc, t) => {
          acc[t.concept] = (acc[t.concept] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    const expenseCategories = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce(
        (acc, t) => {
          acc[t.concept] = (acc[t.concept] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    return [
      ...Object.entries(incomeCategories).map(([name, value]) => ({
        name: `Ingreso: ${name}`,
        value,
        type: 'income',
      })),
      ...Object.entries(expenseCategories).map(([name, value]) => ({
        name: `Gasto: ${name}`,
        value,
        type: 'expense',
      })),
    ].slice(0, 10); // Top 10 categorías
  };

  const handleExportCSV = () => {
    const csvData = transactions.map((t) => ({
      Concepto: t.concept,
      Monto: t.amount,
      Tipo: t.type === 'INCOME' ? 'Ingreso' : 'Gasto',
      Fecha: formatDateForExport(t.date),
      Usuario: t.user.name,
      'Fecha de Creación': formatDateForExport(t.createdAt),
    }));

    exportToCSV(
      csvData,
      `reporte_transacciones_${toDateInputValue(new Date())}.csv`
    );
  };

  const COLORS = [
    '#10B981',
    '#EF4444',
    '#3B82F6',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#6366F1',
  ];

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Navigation />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-1/4 mb-8'></div>
            <div className='h-96 bg-gray-200 rounded'></div>
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
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              Acceso Denegado
            </h1>
            <p className='text-gray-600'>
              Debes iniciar sesión para acceder a esta página
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <Navigation />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
              Acceso Denegado
            </h1>
            <p className='text-gray-600'>
              Solo los administradores pueden acceder a esta página
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const pieData = preparePieData();

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Reportes Financieros
            </h1>
            <p className='text-gray-600 mt-2'>
              Análisis detallado de los movimientos financieros
            </p>
          </div>
          <Button
            onClick={handleExportCSV}
            className='flex items-center space-x-2'
          >
            <Download className='h-4 w-4' />
            <span>Exportar CSV</span>
          </Button>
        </div>

        {/* Tarjetas de resumen */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Saldo Actual
              </CardTitle>
              <DollarSign className='h-4 w-4 text-blue-600' />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatCurrency(summary.balance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Ingresos Totales
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {formatCurrency(summary.totalIncome)}
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
                {formatCurrency(summary.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Transacciones
              </CardTitle>
              <FileText className='h-4 w-4 text-purple-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {summary.totalTransactions}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <BarChart3 className='h-5 w-5' />
                <span>Movimientos por Mes</span>
              </CardTitle>
              <CardDescription>
                Comparación de ingresos vs gastos por mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey='income' fill='#10B981' name='Ingresos' />
                  <Bar dataKey='expenses' fill='#EF4444' name='Gastos' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <BarChart3 className='h-5 w-5' />
                <span>Distribución por Categoría</span>
              </CardTitle>
              <CardDescription>
                Top 10 categorías de ingresos y gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[Math.floor(Math.random() * COLORS.length)]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de transacciones recientes */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Calendar className='h-5 w-5' />
              <span>Transacciones Recientes</span>
            </CardTitle>
            <CardDescription>
              Últimas 10 transacciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    <Badge
                      variant={
                        transaction.type === 'INCOME'
                          ? 'success'
                          : 'destructive'
                      }
                    >
                      {transaction.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                    </Badge>
                    <span className='font-medium'>{transaction.concept}</span>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <span
                      className={`font-semibold ${
                        transaction.type === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {(() => {
                        const date = safeParseDate(transaction.date);
                        return date
                          ? date.toLocaleDateString('es-CO')
                          : 'Fecha inválida';
                      })()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
