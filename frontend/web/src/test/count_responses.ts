import fs from 'fs';
import path from 'path';

const apiDtsPath = path.resolve(process.cwd(), 'src/types/api.d.ts');
const content = fs.readFileSync(apiDtsPath, 'utf8');

// Count operations in export interface operations
const operationsMatch = content.match(/export interface operations \{([\s\S]*?)\n\}/);
if (!operationsMatch) {
  console.log('No operations interface found');
  process.exit(1);
}

const opsContent = operationsMatch[1];

// Count total operations
const totalOps = (opsContent.match(/^[ \t]*[a-zA-Z0-9_-]+:\s*\{/gm) || []).length;

// Count operations that have non-never response content (content: {)
const realContentOps = (opsContent.match(/responses:\s*\{[\s\S]*?content:\s*\{/g) || []).length;

// Count operations where response content is explicit "content?: never"
const neverContentOps = (opsContent.match(/content\?: never/g) || []).length;

console.log(`Total API operations in api.d.ts: ${totalOps}`);
console.log(`Operations with real non-never response schema: ${realContentOps}`);
console.log(`Operations with empty response schema (content?: never): ${neverContentOps}`);
