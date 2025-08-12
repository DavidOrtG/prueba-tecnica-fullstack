#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Run this script to verify all required environment variables are set
 */

const requiredVars = [
  'GITHUB_ID',
  'GITHUB_SECRET', 
  'DATABASE_URL'
];

const optionalVars = [
  'NODE_ENV',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('🔍 Verifying Environment Variables...\n');

let allRequiredSet = true;

// Check required variables
console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
    allRequiredSet = false;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: NOT SET (optional)`);
  }
});

console.log('\n📊 Summary:');
if (allRequiredSet) {
  console.log('  🎉 All required environment variables are set!');
  console.log('  🚀 Your application should work correctly.');
} else {
  console.log('  ❌ Some required environment variables are missing!');
  console.log('  🔧 Please set the missing variables and try again.');
  process.exit(1);
}

console.log('\n💡 Tip: Create a .env.local file with these variables for local development.');
console.log('   For production, set them in your hosting platform (e.g., Vercel).');
