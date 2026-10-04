import fs from 'fs';

const content = fs.readFileSync('src/types/api.d.ts', 'utf8');

// Match paths in paths interface
const pathsSection = content.match(/export interface paths \{([\s\S]*?)\n\}/);
if (!pathsSection) {
  console.log('No paths interface found');
  process.exit(1);
}

const rawPaths = pathsSection[1];
const pathRegex = /"(\/[^"]*)":/g;
let match;
const allPaths: string[] = [];

while ((match = pathRegex.exec(rawPaths)) !== null) {
  allPaths.push(match[1]);
}

console.log(`Total endpoints in api.d.ts: ${allPaths.length}`);
console.log('--- ALL ENDPOINTS ---');
allPaths.sort().forEach((p) => console.log(p));
