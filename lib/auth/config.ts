import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

// Validate required environment variables
const requiredEnvVars = {
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
};

// Check if all required environment variables are present
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const prisma = new PrismaClient();

// Test database connection
try {
  await prisma.$connect();
} catch {
  throw new Error('Database connection failed');
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: requiredEnvVars.GITHUB_ID!,
      clientSecret: requiredEnvVars.GITHUB_SECRET!,
    },
  },
  // Remove callbacks and pages as they may not be supported in v1.1.1
  // The basic configuration should work for now
});

export { prisma };
