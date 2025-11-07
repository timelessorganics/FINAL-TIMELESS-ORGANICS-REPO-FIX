#!/usr/bin/env node

/**
 * Deployment Diagnostic Script
 * Checks common issues with Replit → GitHub → Railway → Netlify pipeline
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

function checkmark(condition) {
  return condition ? '✅' : '❌';
}

console.log('\n' + '='.repeat(70));
log('🔍 DEPLOYMENT PIPELINE DIAGNOSTIC', 'cyan');
console.log('='.repeat(70) + '\n');

// 1. Git Configuration
log('📦 1. Git Configuration', 'blue');
console.log('-'.repeat(70));

const gitRemote = exec('git remote -v');
const gitBranch = exec('git branch --show-current');
const gitStatus = exec('git status --short');

if (gitRemote) {
  const hasOrigin = gitRemote.includes('github.com');
  log(`${checkmark(hasOrigin)} Git remote configured`, hasOrigin ? 'green' : 'red');
  if (hasOrigin) {
    const repoUrl = gitRemote.split('\n')[0].split('\t')[1].split(' ')[0];
    console.log(`   Repository: ${repoUrl}`);
  }
} else {
  log('❌ No git remote found', 'red');
}

log(`${checkmark(gitBranch === 'main')} Current branch: ${gitBranch || 'unknown'}`, 
    gitBranch === 'main' ? 'green' : 'yellow');

if (gitStatus) {
  log('⚠️  Uncommitted changes detected:', 'yellow');
  console.log(gitStatus.split('\n').map(line => `   ${line}`).join('\n'));
} else {
  log('✅ Working directory clean', 'green');
}

console.log();

// 2. Required Files
log('📄 2. Required Configuration Files', 'blue');
console.log('-'.repeat(70));

const requiredFiles = [
  { path: 'package.json', name: 'Package manifest' },
  { path: 'railway.json', name: 'Railway config' },
  { path: '.gitignore', name: 'Git ignore file' },
  { path: 'server/index.ts', name: 'Server entry point' },
  { path: 'vite.config.ts', name: 'Vite config' },
  { path: 'tsconfig.json', name: 'TypeScript config' },
];

requiredFiles.forEach(({ path, name }) => {
  const exists = existsSync(path);
  log(`${checkmark(exists)} ${name}: ${path}`, exists ? 'green' : 'red');
});

console.log();

// 3. Package.json Scripts
log('🔧 3. Build & Deploy Scripts', 'blue');
console.log('-'.repeat(70));

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'build', 'start', 'db:push'];

requiredScripts.forEach(script => {
  const exists = packageJson.scripts && packageJson.scripts[script];
  log(`${checkmark(exists)} Script "${script}"`, exists ? 'green' : 'red');
  if (exists) {
    console.log(`   ${packageJson.scripts[script]}`);
  }
});

console.log();

// 4. Railway Configuration
log('🚂 4. Railway Configuration', 'blue');
console.log('-'.repeat(70));

if (existsSync('railway.json')) {
  const railwayConfig = JSON.parse(readFileSync('railway.json', 'utf8'));
  const hasBuildCommand = railwayConfig.build?.buildCommand;
  const hasStartCommand = railwayConfig.deploy?.startCommand;
  
  log(`${checkmark(hasBuildCommand)} Build command configured`, hasBuildCommand ? 'green' : 'red');
  if (hasBuildCommand) {
    console.log(`   ${railwayConfig.build.buildCommand}`);
  }
  
  log(`${checkmark(hasStartCommand)} Start command configured`, hasStartCommand ? 'green' : 'red');
  if (hasStartCommand) {
    console.log(`   ${railwayConfig.deploy.startCommand}`);
  }
} else {
  log('❌ railway.json not found', 'red');
}

console.log();

// 5. Environment Variables Check
log('🔐 5. Environment Variables (Sample Check)', 'blue');
console.log('-'.repeat(70));

const envVars = [
  { name: 'DATABASE_URL', required: true },
  { name: 'SESSION_SECRET', required: true },
  { name: 'PAYFAST_MERCHANT_ID', required: true },
  { name: 'PAYFAST_MERCHANT_KEY', required: true },
  { name: 'PAYFAST_PASSPHRASE', required: true },
  { name: 'PAYFAST_MODE', required: true },
  { name: 'SUPABASE_URL', required: false },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: false },
];

log('⚠️  Note: This only checks local environment. Verify Railway/Netlify separately!', 'yellow');
console.log();

envVars.forEach(({ name, required }) => {
  const value = process.env[name];
  const isSet = !!value;
  const status = required ? (isSet ? 'green' : 'red') : (isSet ? 'green' : 'yellow');
  log(`${checkmark(isSet)} ${name}${required ? ' (required)' : ' (optional)'}`, status);
  
  if (isSet) {
    // Show partial value for security
    if (name.includes('URL')) {
      const url = new URL(value);
      console.log(`   ${url.protocol}//${url.host}/...`);
    } else if (name === 'PAYFAST_MODE') {
      console.log(`   ${value}`);
    } else if (name === 'PAYFAST_MERCHANT_ID') {
      console.log(`   ${value}`);
    } else {
      const masked = value.substring(0, 4) + '*'.repeat(Math.min(value.length - 4, 20));
      console.log(`   ${masked}`);
    }
  }
});

console.log();

// 6. PayFast Configuration Validation
log('💳 6. PayFast Configuration', 'blue');
console.log('-'.repeat(70));

const payfastMode = process.env.PAYFAST_MODE;
const payfastMerchantId = process.env.PAYFAST_MERCHANT_ID;

if (payfastMode && payfastMerchantId) {
  const isSandbox = payfastMode === 'sandbox';
  const isSandboxMerchant = payfastMerchantId === '10000100';
  const isProductionMerchant = payfastMerchantId === '10043126';
  
  log(`Mode: ${payfastMode}`, 'cyan');
  log(`Merchant ID: ${payfastMerchantId}`, 'cyan');
  
  if (isSandbox && isSandboxMerchant) {
    log('✅ Sandbox mode with sandbox credentials (correct)', 'green');
  } else if (!isSandbox && isProductionMerchant) {
    log('✅ Production mode with production credentials (correct)', 'green');
  } else if (isSandbox && !isSandboxMerchant) {
    log('⚠️  Sandbox mode with production merchant ID (this may cause errors!)', 'yellow');
    log('   Expected merchant ID for sandbox: 10000100', 'yellow');
  } else if (!isSandbox && isSandboxMerchant) {
    log('⚠️  Production mode with sandbox merchant ID (this will fail!)', 'red');
  } else {
    log('⚠️  Unable to validate PayFast configuration', 'yellow');
  }
} else {
  log('❌ PayFast environment variables not set', 'red');
}

console.log();

// 7. Database Connection String Validation
log('🗄️  7. Database Connection', 'blue');
console.log('-'.repeat(70));

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    const isSupabase = url.host.includes('supabase');
    const usesPooler = url.port === '6543';
    const hasPgBouncer = url.searchParams.has('pgbouncer');
    
    log(`${checkmark(isSupabase)} Supabase connection detected`, isSupabase ? 'green' : 'yellow');
    log(`${checkmark(usesPooler)} Using connection pooler (port 6543)`, usesPooler ? 'green' : 'yellow');
    log(`${checkmark(hasPgBouncer)} pgbouncer parameter present`, hasPgBouncer ? 'green' : 'yellow');
    
    console.log(`   Host: ${url.host}`);
    console.log(`   Port: ${url.port || '5432'}`);
    console.log(`   Database: ${url.pathname.substring(1)}`);
    
    if (!usesPooler) {
      log('   ⚠️  Consider using port 6543 (connection pooler) for better performance', 'yellow');
    }
  } catch (error) {
    log('❌ Invalid DATABASE_URL format', 'red');
  }
} else {
  log('❌ DATABASE_URL not set', 'red');
}

console.log();

// 8. Dependencies Check
log('📦 8. Critical Dependencies', 'blue');
console.log('-'.repeat(70));

const criticalDeps = [
  'express',
  'drizzle-orm',
  '@supabase/supabase-js',
  'vite',
  'react',
  'esbuild',
];

criticalDeps.forEach(dep => {
  const installed = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
  log(`${checkmark(installed)} ${dep}`, installed ? 'green' : 'red');
  if (installed) {
    console.log(`   ${installed}`);
  }
});

console.log();

// 9. Build Test
log('🔨 9. Build Test (Dry Run)', 'blue');
console.log('-'.repeat(70));

log('Checking if build would likely succeed...', 'cyan');

const hasNodeModules = existsSync('node_modules');
log(`${checkmark(hasNodeModules)} node_modules installed`, hasNodeModules ? 'green' : 'yellow');

const hasDistFolder = existsSync('dist');
if (hasDistFolder) {
  log('✅ dist/ folder exists (previous build)', 'green');
  const distFiles = exec('ls -la dist');
  if (distFiles) {
    console.log(distFiles.split('\n').slice(0, 5).map(line => `   ${line}`).join('\n'));
  }
} else {
  log('⚠️  No dist/ folder (run npm run build)', 'yellow');
}

console.log();

// 10. Summary & Recommendations
log('📋 10. Summary & Recommendations', 'blue');
console.log('-'.repeat(70));

const issues = [];
const warnings = [];

if (!gitRemote || !gitRemote.includes('github.com')) {
  issues.push('Git remote not configured - cannot push to GitHub');
}

if (gitStatus) {
  warnings.push('Uncommitted changes - commit before deploying');
}

if (!process.env.DATABASE_URL) {
  issues.push('DATABASE_URL not set - app will crash on startup');
}

if (!process.env.PAYFAST_MERCHANT_ID) {
  issues.push('PayFast credentials not set - payments will fail');
}

if (payfastMode === 'sandbox' && payfastMerchantId !== '10000100') {
  warnings.push('PayFast sandbox mode with non-sandbox merchant ID - may cause errors');
}

if (!hasNodeModules) {
  warnings.push('Dependencies not installed - run npm install');
}

if (issues.length === 0 && warnings.length === 0) {
  log('\n🎉 No critical issues found! Your setup looks good.', 'green');
  console.log();
  log('Next steps:', 'cyan');
  console.log('1. Commit any pending changes: git add . && git commit -m "message"');
  console.log('2. Push to GitHub: git push origin main');
  console.log('3. Railway will auto-deploy from GitHub');
  console.log('4. Verify Railway environment variables match local');
  console.log('5. Test the deployment thoroughly');
} else {
  if (issues.length > 0) {
    log('\n❌ Critical Issues Found:', 'red');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }
  
  if (warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
  }
  
  console.log();
  log('📖 See DEPLOYMENT_TROUBLESHOOTING.md for solutions', 'cyan');
}

console.log('\n' + '='.repeat(70));
log('Diagnostic complete!', 'cyan');
console.log('='.repeat(70) + '\n');
