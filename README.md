# Sistema de Gestión Financiera

Una aplicación fullstack completa para la gestión de ingresos y gastos con autenticación, roles y permisos, desarrollada con Next.js, TypeScript, Prisma y PostgreSQL.

## 🚀 Características

- **Autenticación**: Sistema de autenticación con GitHub OAuth usando Better Auth
- **Roles y Permisos**: Control de acceso basado en roles (RBAC) con usuarios y administradores
- **Gestión de Transacciones**: CRUD completo para ingresos y gastos
- **Gestión de Usuarios**: Administración de usuarios y roles (solo para administradores)
- **Reportes**: Gráficos y análisis financieros con exportación a CSV
- **API REST**: Endpoints completamente documentados con OpenAPI/Swagger
- **Base de Datos**: PostgreSQL con Prisma ORM
- **UI Moderna**: Interfaz construida con Tailwind CSS y componentes shadcn/ui
- **Pruebas Unitarias**: Cobertura de pruebas con Jest y React Testing Library

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15** con Pages Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** para componentes
- **React Hook Form** para formularios
- **Recharts** para gráficos
- **Lucide React** para iconos

### Backend
- **Next.js API Routes**
- **Better Auth** para autenticación
- **Prisma** como ORM
- **PostgreSQL** como base de datos

### Testing
- **Jest** como framework de pruebas
- **React Testing Library** para pruebas de componentes
- **Cobertura de pruebas** configurada

## 📋 Requisitos Previos

- **Node.js** 18.0 o superior
- **npm**, **yarn** o **bun** como gestor de paquetes
- **PostgreSQL** 12 o superior
- **Cuenta de GitHub** para OAuth

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd prueba-tecnica-fullstack
```

### 2. Instalar dependencias

```bash
# Con npm
npm install

# Con yarn
yarn install

# Con bun
bun install
```

### 3. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/prueba_tecnica"

# GitHub OAuth
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_key"
```

### 4. Configurar GitHub OAuth

1. Ir a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crear una nueva OAuth App
3. Configurar:
   - **Application name**: Sistema de Gestión Financiera
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copiar el Client ID y Client Secret al archivo `.env.local`

### 5. Configurar la base de datos

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en la base de datos
npm run db:push

# (Opcional) Abrir Prisma Studio para ver los datos
npm run db:studio
```

### 6. Ejecutar la aplicación

```bash
# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🧪 Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage
```

## 📚 Uso de la Aplicación

### 1. Inicio de Sesión
- Todos los nuevos usuarios se registran automáticamente como **ADMIN**
- Usar GitHub OAuth para autenticación
- No se requiere registro manual

### 2. Dashboard Principal
- Resumen de ingresos, gastos y balance
- Acceso rápido a todas las funcionalidades
- Estadísticas en tiempo real

### 3. Gestión de Movimientos
- **Usuarios**: Ver lista de transacciones
- **Administradores**: Crear, editar y eliminar transacciones
- Filtros por tipo (ingreso/gasto) y fecha

### 4. Gestión de Usuarios (Solo Admin)
- Ver lista de todos los usuarios
- Editar nombres y roles
- Asignar permisos de administrador

### 5. Reportes (Solo Admin)
- Gráficos de movimientos por mes
- Distribución por categorías
- Exportación de datos a CSV
- Análisis de tendencias

## 🔌 API Endpoints

### Autenticación
- `GET /api/auth/session` - Obtener sesión actual
- `GET /api/auth/signin/github` - Iniciar sesión con GitHub
- `POST /api/auth/signout` - Cerrar sesión

### Transacciones
- `GET /api/transactions` - Listar transacciones
- `POST /api/transactions` - Crear transacción (Admin)
- `PUT /api/transactions/[id]` - Actualizar transacción (Admin)
- `DELETE /api/transactions/[id]` - Eliminar transacción (Admin)

### Usuarios
- `GET /api/users` - Listar usuarios (Admin)
- `PUT /api/users/[id]` - Actualizar usuario (Admin)

### Resumen
- `GET /api/summary` - Obtener estadísticas del dashboard

### Documentación
- `GET /api/docs` - Documentación completa de la API

## 🏗️ Estructura del Proyecto

```
prueba-tecnica-fullstack/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de UI base
│   └── Navigation.tsx  # Navegación principal
├── lib/                # Utilidades y configuración
│   ├── auth/           # Configuración de autenticación
│   ├── hooks/          # Hooks personalizados
│   ├── types.ts        # Tipos de TypeScript
│   └── utils.ts        # Funciones de utilidad
├── pages/              # Páginas de la aplicación
│   ├── api/            # API Routes
│   ├── auth/           # Páginas de autenticación
│   └── index.tsx       # Página principal
├── prisma/             # Configuración de base de datos
│   └── schema.prisma   # Esquema de Prisma
├── styles/             # Estilos globales
├── __tests__/          # Pruebas unitarias
└── public/             # Archivos estáticos
```

## 🔒 Seguridad

- **Autenticación obligatoria** para la mayoría de endpoints
- **Control de acceso basado en roles** (RBAC)
- **Validación de datos** con Zod
- **Protección CSRF** integrada
- **Sanitización de inputs** automática

## 🚀 Despliegue en Vercel

### 1. Preparar el proyecto

```bash
# Construir la aplicación
npm run build

# Verificar que no hay errores
npm run lint
```

### 2. Configurar en Vercel

1. Conectar el repositorio de GitHub
2. Configurar variables de entorno:
   - `DATABASE_URL`
   - `GITHUB_ID`
   - `GITHUB_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL de producción)

### 3. Desplegar

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verificar que PostgreSQL esté ejecutándose
- Confirmar que `DATABASE_URL` sea correcta
- Ejecutar `npm run db:generate` y `npm run db:push`

### Error de autenticación GitHub
- Verificar que `GITHUB_ID` y `GITHUB_SECRET` sean correctos
- Confirmar que la callback URL esté configurada correctamente

### Errores de TypeScript
- Ejecutar `npm run build` para ver errores de compilación
- Verificar que todas las dependencias estén instaladas

## 📝 Notas de Desarrollo

- **Todos los nuevos usuarios son ADMIN por defecto** para facilitar las pruebas
- La aplicación **no es responsiva** según los requisitos
- Se incluyen **3 pruebas unitarias** como mínimo requerido
- **Documentación completa de la API** disponible en `/api/docs`

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, por favor abrir un issue en el repositorio.
