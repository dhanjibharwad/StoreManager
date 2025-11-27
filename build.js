// Simple build script to check environment before Netlify build
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Starting build process for Netlify deployment...');

// Check if netlify.toml exists
if (fs.existsSync('./netlify.toml')) {
  console.log('✅ netlify.toml configuration found');
} else {
  console.error('❌ netlify.toml not found. This may cause deployment issues.');
  process.exit(1);
}

// Check Node.js version
console.log(`📊 Node version: ${process.version}`);
console.log(`📊 NPM version: ${execSync('npm -v').toString().trim()}`);

// Check for required dependencies
try {
  console.log('📦 Checking for @netlify/plugin-nextjs...');
  require.resolve('@netlify/plugin-nextjs');
  console.log('✅ @netlify/plugin-nextjs found');
} catch (e) {
  console.error('❌ @netlify/plugin-nextjs not found. Installing...');
  execSync('npm install -D @netlify/plugin-nextjs', { stdio: 'inherit' });
}

// Run the Next.js build (static export is handled by next.config.ts)
console.log('🔨 Building Next.js application with static export...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build and export completed successfully');
} catch (e) {
  console.error('❌ Build failed');
  process.exit(1);
}

console.log('🎉 Build process completed. Ready for Netlify deployment!'); 