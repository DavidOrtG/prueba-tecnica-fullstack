# 🚀 Prueba Técnica Fullstack - Sistema de Gestión Financiera

Un sistema completo de gestión financiera construido con Next.js, TypeScript, Tailwind CSS y PostgreSQL.

## ✨ **Características Principales**

- 🔐 **Autenticación OAuth** con GitHub
- 👥 **Control de Acceso Basado en Roles** (ADMIN/USER)
- 💰 **Gestión de Transacciones** (Ingresos y Gastos)
- 📊 **Dashboard Financiero** con resúmenes
- 👤 **Gestión de Usuarios** (solo administradores)
- 📚 **Documentación de API** completa con OpenAPI/Swagger
- 🎨 **Interfaz Moderna** con Shadcn/UI y Tailwind CSS

## 🛠️ **Stack Tecnológico**

### Frontend

- ✅ **Next.js** con Pages Router
- ✅ **TypeScript**
- ✅ **Tailwind CSS**
- ✅ **Shadcn/UI** para componentes
- ✅ **NextJS API routes** para comunicación

### Backend

- ✅ **NextJS API routes** para endpoints REST
- ✅ **PostgreSQL** en Supabase
- ✅ **Prisma ORM**
- ✅ **Better-Auth** para autenticación
- ✅ **OpenAPI/Swagger** para documentación

## 🚀 **Despliegue en Vercel**

### 1. **Preparación del Proyecto**

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd prueba-tecnica-fullstack

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
```

### 2. **Variables de Entorno Requeridas**

Crea un archivo `.env.local` con las siguientes variables:

```env
# Base de datos
DATABASE_URL="postgresql://username:password@host:port/database"

# GitHub OAuth
GITHUB_ID="tu_github_client_id"
GITHUB_SECRET="tu_github_client_secret"

# Next.js
NEXTAUTH_SECRET="tu_secret_aleatorio"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. **Configuración de Supabase**

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Obtén la URL de conexión de la base de datos
4. Ejecuta las migraciones de Prisma:

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push

# (Opcional) Ver datos en Supabase Studio
npx prisma studio
```

### 4. **Configuración de GitHub OAuth**

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea una nueva OAuth App
3. Configura la URL de callback: `https://tu-app.vercel.app/api/auth/callback/github`
4. Copia el Client ID y Client Secret

### 5. **Despliegue en Vercel**

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`
   - `GITHUB_ID`
   - `GITHUB_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL de producción)

3. Vercel detectará automáticamente que es un proyecto Next.js
4. El build se ejecutará automáticamente

### 6. **Post-Despliegue**

1. Actualiza la URL de callback de GitHub con tu dominio de Vercel
2. Verifica que la base de datos esté accesible desde Vercel
3. Prueba la autenticación y funcionalidades principales

## 📚 **Documentación de la API**

### Endpoint de Documentación

- **URL**: `/api/docs`
- **Página Web**: `/docs`
- **Formato**: OpenAPI 3.0 / Swagger

### Endpoints Principales

#### 🔐 Autenticación

- `GET /api/auth/signin/github` - Iniciar sesión con GitHub
- `GET /api/auth/callback/github` - Callback de OAuth
- `GET /api/auth/signout` - Cerrar sesión

#### 💰 Transacciones

- `GET /api/transactions` - Obtener transacciones
- `POST /api/transactions` - Crear transacción (solo admin)
- `GET /api/transactions/[id]` - Obtener transacción específica
- `PUT /api/transactions/[id]` - Actualizar transacción (solo admin)
- `DELETE /api/transactions/[id]` - Eliminar transacción (solo admin)

#### 📊 Resúmenes

- `GET /api/summary` - Resumen financiero

#### 👥 Usuarios

- `GET /api/users` - Lista de usuarios
- `GET /api/users/[id]` - Perfil de usuario específico
- `PUT /api/users/[id]` - Actualizar usuario (solo admin)
- `DELETE /api/users/[id]` - Eliminar usuario (solo admin)

## 🔒 **Control de Acceso**

### Usuarios Administradores (ADMIN)

- ✅ Acceso completo a todas las funcionalidades
- ✅ Pueden ver, crear, editar y eliminar transacciones
- ✅ Pueden gestionar usuarios del sistema
- ✅ Ven resúmenes financieros completos

### Usuarios Regulares (USER)

- ✅ Pueden ver solo sus propias transacciones
- ✅ Pueden ver solo su propio resumen financiero
- ✅ Pueden ver solo su propio perfil
- ❌ No pueden modificar datos
- ❌ No pueden acceder a funcionalidades administrativas

## 🧪 **Pruebas**

```bash
# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ver cobertura de pruebas
npm run test:coverage
```

## 📁 **Estructura del Proyecto**

```
prueba-tecnica-fullstack/
├── components/          # Componentes reutilizables
├── lib/                # Utilidades y configuración
│   ├── auth/          # Configuración de autenticación
│   └── hooks/         # Hooks personalizados
├── pages/              # Páginas y API routes
│   ├── api/           # Endpoints de la API
│   └── ...            # Páginas del frontend
├── prisma/             # Esquema y migraciones de BD
├── __tests__/          # Pruebas unitarias
└── public/             # Archivos estáticos
```

## 🚨 **Solución de Problemas**

### Error de Conexión a Base de Datos

- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que Supabase permita conexiones desde Vercel
- Verifica que las migraciones se hayan ejecutado

### Error de Autenticación GitHub

- Verifica que `GITHUB_ID` y `GITHUB_SECRET` estén correctos
- Asegúrate de que la URL de callback coincida con tu dominio
- Verifica que la app OAuth esté configurada correctamente

### Error de Build en Vercel

- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Vercel
- Asegúrate de que las dependencias estén en `package.json`

## 📞 **Soporte**

Para soporte técnico o preguntas sobre el despliegue:

- Revisa los logs de Vercel
- Verifica la configuración de variables de entorno
- Consulta la documentación de la API en `/docs`

## 🎯 **Estado de Implementación**

- ✅ **Frontend**: Next.js + TypeScript + Tailwind + Shadcn
- ✅ **Backend**: NextJS API routes + PostgreSQL + Prisma
- ✅ **Autenticación**: GitHub OAuth + Better-Auth
- ✅ **Base de Datos**: PostgreSQL en Supabase
- ✅ **Documentación**: OpenAPI/Swagger en `/api/docs`
- ✅ **Control de Acceso**: RBAC implementado
- ✅ **Pruebas**: Unitarias implementadas
- ✅ **Despliegue**: Listo para Vercel

¡Tu aplicación está lista para ser desplegada en Vercel! 🚀
