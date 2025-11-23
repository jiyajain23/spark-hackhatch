#!/usr/bin/env node
/**
 * This script extracts ABIs from Hardhat artifacts and creates
 * TypeScript/JavaScript modules that can be imported in the frontend
 */

const fs = require('fs');
const path = require('path');

const artifactsDir = path.join(__dirname, '../artifacts/contracts');
const outputDir = path.join(__dirname, '../src/contracts');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Contracts to extract
const contracts = [
  { name: 'CreatorTokenFactory', file: 'CreatorTokenFactory.sol/CreatorTokenFactory.json' },
  { name: 'CreatorToken', file: 'CreatorToken.sol/CreatorToken.json' },
  { name: 'PlatformTreasury', file: 'PlatformTreasury.sol/PlatformTreasury.json' },
  { name: 'AccessController', file: 'AccessController.sol/AccessController.json' },
  { name: 'MetaTransactionForwarder', file: 'MetaTransactionForwarder.sol/MetaTransactionForwarder.json' },
];

console.log('📦 Extracting contract ABIs...\n');

contracts.forEach(({ name, file }) => {
  try {
    const artifactPath = path.join(artifactsDir, file);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    const output = `// Auto-generated from Hardhat artifacts
// Contract: ${name}

export const ${name}ABI = ${JSON.stringify(artifact.abi, null, 2)} as const;

export default ${name}ABI;
`;
    
    const outputPath = path.join(outputDir, `${name}.ts`);
    fs.writeFileSync(outputPath, output);
    
    console.log(`✅ ${name}.ts created`);
  } catch (error) {
    console.error(`❌ Failed to process ${name}:`, error.message);
  }
});

// Create index file
const indexContent = `// Auto-generated contract ABI exports

${contracts.map(({ name }) => `export { default as ${name}ABI } from './${name}';`).join('\n')}

// Re-export all ABIs as a single object
${contracts.map(({ name }) => `import { ${name}ABI } from './${name}';`).join('\n')}

export const ABIs = {
${contracts.map(({ name }) => `  ${name}: ${name}ABI,`).join('\n')}
};
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);
console.log(`✅ index.ts created`);

console.log('\n🎉 All ABIs extracted successfully!\n');
console.log('You can now import them in your frontend:');
console.log("  import { CreatorTokenFactoryABI } from './contracts';");
