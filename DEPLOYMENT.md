# Deployment Guide

## Environment Variables

Make sure these environment variables are set in your production environment:

```bash
# GitHub OAuth
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Node Environment
NODE_ENV=production
```

## Vercel Deployment

1. **Environment Variables**: Set all required environment variables in your Vercel project settings
2. **Build Command**: The build script automatically runs `prisma generate` before building
3. **Database**: Ensure your PostgreSQL database is accessible from Vercel's servers

## Database Setup

1. **Run Migrations**: Ensure your production database has the latest schema:
   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Client**: The Prisma client is automatically generated during build

## Troubleshooting

### 500 Error on GitHub OAuth Callback

1. **Check Environment Variables**: Visit `/api/health` to verify all required variables are set
2. **Database Connection**: Ensure your database is accessible and the connection string is correct
3. **GitHub OAuth App**: Verify your GitHub OAuth app settings match your production domain
4. **Logs**: Check Vercel function logs for detailed error messages

### Common Issues

- **Missing Environment Variables**: The app will now fail fast with clear error messages
- **Database Connection**: Connection issues are now caught and logged
- **Prisma Client**: Automatically generated during build and postinstall

## Health Check Endpoint

Use `/api/health` to verify your production environment is properly configured:

```bash
curl https://your-domain.vercel.app/api/health
```

This will show:
- Environment variable status
- Database connection status
- Server uptime
- Current timestamp
