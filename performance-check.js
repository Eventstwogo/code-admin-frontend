// Simple performance check script
const fs = require('fs');
const path = require('path');

console.log('🔍 Performance Check Report');
console.log('============================');

// Check bundle size
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  const stats = fs.statSync(nextDir);
  console.log(`📦 .next directory size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
} else {
  console.log('📦 .next directory not found (first build)');
}

// Check node_modules size
const nodeModulesDir = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesDir)) {
  const getDirectorySize = (dirPath) => {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });
    
    return totalSize;
  };
  
  try {
    const size = getDirectorySize(nodeModulesDir);
    console.log(`📚 node_modules size: ${(size / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.log('📚 Could not calculate node_modules size');
  }
}

// Memory usage
const memUsage = process.memoryUsage();
console.log(`🧠 Memory Usage:`);
console.log(`   RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);

console.log('\n✅ Performance check complete!');
console.log('\n💡 Tips for better performance:');
console.log('   - Use lazy loading for images');
console.log('   - Implement code splitting');
console.log('   - Use React.memo for expensive components');
console.log('   - Debounce search inputs');
console.log('   - Optimize bundle size');