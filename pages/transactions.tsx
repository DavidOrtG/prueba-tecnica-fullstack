import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const transactionSchema = z.object({
  concept: z.string().min(1, 'El concepto es requerido'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().min(1, 'La fecha es requerida'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const Transactions = () => {
  const { session, loading, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch {
      // Failed to fetch transactions
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      // Validate session and user ID
      if (!session?.user?.id) {
        alert('Session expired. Please sign in again.');
        return;
      }

      const url = editingTransaction
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions';

      const method = editingTransaction ? 'PUT' : 'POST';

      // For new transactions, include the current user's ID
      const requestData = editingTransaction
        ? data
        : { ...data, userId: session.user.id };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        reset();
        setEditingTransaction(null);
        fetchTransactions();
      } else {
        // Handle error response
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save transaction'}`);
      }
    } catch {
      alert('Error saving transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    reset({
      concept: transaction.concept,
      amount: transaction.amount,
      type: transaction.type,
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?'))
      return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTransactions();
      }
    } catch {
      // Failed to delete transaction
    }
  };

  const openNewModal = () => {
    setEditingTransaction(null);
    reset({
      concept: '',
      amount: 0,
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

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

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Gestión de Movimientos
            </h1>
            <p className='text-gray-600 mt-2'>
              {isAdmin
                ? 'Administra todos los ingresos y gastos del sistema'
                : 'Visualiza tus ingresos y gastos personales (solo lectura)'}
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={openNewModal}
              className='flex items-center space-x-2'
            >
              <Plus className='h-4 w-4' />
              <span>Nuevo Movimiento</span>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Movimientos Financieros</CardTitle>
            <CardDescription>
              Lista de todos los ingresos y gastos registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  {isAdmin && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className='font-medium'>
                      {transaction.concept}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === 'INCOME'
                            ? 'success'
                            : 'destructive'
                        }
                      >
                        {transaction.type === 'INCOME' ? (
                          <TrendingUp className='h-3 w-3 mr-1' />
                        ) : (
                          <TrendingDown className='h-3 w-3 mr-1' />
                        )}
                        {transaction.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateShort(transaction.date)}</TableCell>
                    <TableCell>{transaction.user.name}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(transaction.id)}
                            className='text-red-600 hover:text-red-700'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
          reset();
        }}
        title={editingTransaction ? 'Editar Movimiento' : 'Nuevo Movimiento'}
        size='md'
      >
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Concepto
            </label>
            <Input
              {...register('concept')}
              placeholder='Descripción del movimiento'
              className={errors.concept ? 'border-red-500' : ''}
            />
            {errors.concept && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.concept.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Monto
            </label>
            <Input
              {...register('amount', { valueAsNumber: true })}
              type='number'
              step='0.01'
              min='0'
              placeholder='0.00'
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Tipo
            </label>
            <Select {...register('type')}>
              <option value='INCOME'>Ingreso</option>
              <option value='EXPENSE'>Gasto</option>
            </Select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Fecha
            </label>
            <Input
              {...register('date')}
              type='date'
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className='text-red-500 text-sm mt-1'>{errors.date.message}</p>
            )}
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setIsModalOpen(false);
                setEditingTransaction(null);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading
                ? 'Guardando...'
                : editingTransaction
                  ? 'Actualizar'
                  : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;
