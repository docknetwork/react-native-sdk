const fs = require('fs');
const path = require('path');

// Get directory from command-line argument
const directory = process.argv[2];

if (!directory) {
  console.error('Usage: node fix-build-imports.js <directory>');
  process.exit(1);
}

// Regular expression to match any occurrence of `@docknetwork/wallet-sdk-[any package]/src`
const referenceRegex = /(@docknetwork\/wallet-sdk-[^/]+)\/src\b/g;

// Function to replace paths in files
function replacePathsInFile(filePath) {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const newContent = fileContent.replace(referenceRegex, '$1/lib');

  if (newContent !== fileContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Function to recursively process files in the directory
function processDirectory(directory) {
  fs.readdirSync(directory).forEach(file => {
    const filePath = path.join(directory, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDirectory(filePath);
    } else if (
      filePath.endsWith('.js') ||
      filePath.endsWith('.ts') ||
      filePath.endsWith('.jsx') ||
      filePath.endsWith('.tsx') ||
      filePath.endsWith('.mjs') ||
      filePath.endsWith('.cjs')
    ) {
      replacePathsInFile(filePath);
    }
  });
}

processDirectory(directory);
console.log('Replacement complete!');
