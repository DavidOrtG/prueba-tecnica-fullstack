import { PrismaClient } from '@prisma/client';

// Create Prisma client instance with production optimizations
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Validate required environment variables
const requiredEnvVars = {
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
};

// Check if all required environment variables are present
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  // In production, we want to fail fast if critical env vars are missing
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Test database connection on startup
const testConnection = async () => {
  try {
    await prisma.$connect();
    // Connection successful
  } catch (error) {
    // Don't throw in production, let the app start and handle errors gracefully
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  }
};

// Test connection on startup
testConnection();

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
