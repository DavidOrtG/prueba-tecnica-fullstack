import { useEffect, useState } from 'react';
import Image from 'next/image';
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
import { User, UserRole } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Edit,
  Users as UsersIcon,
  Shield,
  User as UserIcon,
} from 'lucide-react';

const userSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  role: z.enum(['USER', 'ADMIN']),
});

type UserFormData = z.infer<typeof userSchema>;

const UsersPage = () => {
  const { session, loading, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (session && isAdmin) {
      fetchUsers();
    }
  }, [session, isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch {
      // Failed to fetch users
    }
  };

  const onSubmit = async (data: UserFormData) => {
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsModalOpen(false);
        reset();
        setEditingUser(null);
        fetchUsers();
      }
    } catch {
      // Failed to update user
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name,
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    if (role === 'ADMIN') {
      return (
        <Badge variant='info' className='flex items-center space-x-1'>
          <Shield className='h-3 w-3' />
          <span>Admin</span>
        </Badge>
      );
    }
    return (
      <Badge variant='secondary' className='flex items-center space-x-1'>
        <UserIcon className='h-3 w-3' />
        <span>Usuario</span>
      </Badge>
    );
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

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Gestión de Usuarios
          </h1>
          <p className='text-gray-600 mt-2'>
            {isAdmin
              ? 'Administra usuarios y sus roles en el sistema'
              : 'Visualiza tu perfil de usuario (solo lectura)'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <UsersIcon className='h-5 w-5' />
              <span>Lista de Usuarios</span>
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? 'Gestiona los usuarios del sistema y sus permisos'
                : 'Lista de usuarios registrados en el sistema'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  {isAdmin && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className='font-medium'>
                      <div className='flex items-center space-x-2'>
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={32}
                            height={32}
                            className='h-8 w-8 rounded-full'
                          />
                        ) : (
                          <div className='h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center'>
                            <UserIcon className='h-4 w-4 text-gray-500' />
                          </div>
                        )}
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'No especificado'}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('es-CO')}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className='h-4 w-4 mr-2' />
                          Editar
                        </Button>
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
          setEditingUser(null);
          reset();
        }}
        title='Editar Usuario'
        size='md'
      >
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Nombre
            </label>
            <Input
              {...register('name')}
              placeholder='Nombre del usuario'
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Rol
            </label>
            <Select {...register('role')}>
              <option value='USER'>Usuario</option>
              <option value='ADMIN'>Administrador</option>
            </Select>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
