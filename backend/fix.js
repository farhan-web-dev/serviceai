const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(__dirname);
let changedCount = 0;

files.forEach(file => {
  if (file === __filename) return; // skip this script
  
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace \` with `
  content = content.replace(/\\`/g, '`');
  // Replace \${ with ${
  content = content.replace(/\\\${/g, '${');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
    changedCount++;
  }
});

console.log('Done. Fixed files:', changedCount);
