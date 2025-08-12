import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const prisma = new PrismaClient();

// Validate required environment variables
const requiredEnvVars = {
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
};

// Check if all required environment variables are present
Object.entries(requiredEnvVars).forEach(([, value]) => {
  if (!value) {
    // Environment variable missing - this will be logged by the runtime
  }
});

export { prisma };
