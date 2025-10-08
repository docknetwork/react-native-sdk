#!/usr/bin/env node

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

async function generateMarkdownDocs() {
  console.log('Generating markdown documentation...');

  const outputDir = path.resolve('../../docs/api');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  const outputFile = path.join(outputDir, 'wasm.md');

  // Get all source files - focusing on main service modules
  const sourceFiles = [
    './src/services/blockchain/*.js',
    './src/services/credential/*.js',
    './src/services/dids/*.js',
    './src/services/relay-service/*.js',
    './src/services/wallet/*.js',
    './src/services/pex/*.js',
    './src/services/util-crypto/*.js',
  ];

  console.log('Processing source files from packages/wasm...');

  const output = await jsdoc2md.render({
    files: sourceFiles,
    configure: './jsdoc.conf.json',
    'no-cache': true,
    template: `# Wallet SDK WASM API Documentation

{{>main}}
`,
  });

  // Ensure we have substantial content
  fs.writeFileSync(outputFile, output);
  console.log(`✅ API documentation generated successfully: ${outputFile}`);
  console.log(`📄 Generated ${output.length} characters of documentation`);
}

generateMarkdownDocs().catch(error => {
  console.error('Error generating documentation:', error);
  process.exit(1);
});
