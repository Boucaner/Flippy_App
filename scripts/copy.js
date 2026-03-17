// Simple build script: copies web assets into www/
const fs = require('fs');
const path = require('path');

function copyFile(src, dest) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
}

copyFile('index.html',    'www/index.html');
copyFile('src/main.js',   'www/src/main.js');
copyFile('src/style.css', 'www/src/style.css');

console.log('Build complete.');
