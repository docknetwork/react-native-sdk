#!/usr/bin/env node

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

async function generateMarkdownDocs() {
  console.log('Generating markdown documentation...');

  const outputDir = path.resolve('../../jsdocs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  const outputFile = path.join(outputDir, 'core.md');

  const output = await jsdoc2md.render({
    files: ['./src/**/*.ts'],
    configure: './jsdoc.conf.json',
    'no-cache': true,
    template: `# Wallet SDK Core API Documentation

{{>main}}
`,
  });

  // Ensure we have substantial content
  fs.writeFileSync(outputFile, output);
  console.log(`✅ API documentation generated successfully: ${outputFile}`);
  console.log(`📄 Generated ${output.length} characters of documentation`);
}

generateMarkdownDocs();
