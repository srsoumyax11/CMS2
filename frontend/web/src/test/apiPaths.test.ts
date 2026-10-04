import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getApiDtsPaths(): Set<string> {
  const apiDtsPath = path.resolve(process.cwd(), 'src/types/api.d.ts');
  const content = fs.readFileSync(apiDtsPath, 'utf8');

  const pathsSection = content.match(/export interface paths \{([\s\S]*?)\n\}/);
  if (!pathsSection) {
    throw new Error('Could not parse paths interface from api.d.ts');
  }

  const rawPaths = pathsSection[1];
  const pathRegex = /"(\/[^"]*)":/g;
  const validPaths = new Set<string>();

  let match;
  while ((match = pathRegex.exec(rawPaths)) !== null) {
    validPaths.add(match[1]);
  }

  return validPaths;
}

function findApiFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'types') {
        files.push(...findApiFiles(fullPath));
      }
    } else if (entry.isFile() && entry.name.endsWith('api.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractEndpointsFromFile(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match string literals and template literals starting with /api/v1/
  const regex = /['"`](\/api\/v1\/[^'"`\s?:=]*)['"`]/g;
  const endpoints: string[] = [];

  let match;
  while ((match = regex.exec(content)) !== null) {
    let rawPath = match[1];

    // Remove query params if any remain
    rawPath = rawPath.split('?')[0];

    // Normalize template variables like ${id} or ${deviceId} or ${pin} to {id} / {pin} / parameter format
    // Match template literal expressions ${...}
    const normalized = rawPath.replace(/\$\{([^}]+)\}/g, (_, expr) => {
      const varName = expr.trim();
      if (varName.toLowerCase().includes('pin')) return '{pin}';
      if (varName.toLowerCase().includes('drive') || varName.toLowerCase().includes('student')) return '{id}';
      if (varName.toLowerCase().includes('roleid')) return '{roleId}';
      if (varName.toLowerCase().includes('termid')) return '{termId}';
      if (varName.toLowerCase().includes('token')) return '{token}';
      if (varName.toLowerCase().includes('guardianid')) return '{guardianId}';
      return '{id}';
    });

    endpoints.push(normalized);
  }

  return endpoints;
}

describe('API Endpoint Path Validator', () => {
  it('scans every path in src/**/api.ts and fails if it does not exist in api.d.ts', () => {
    const validPaths = getApiDtsPaths();
    const apiFiles = findApiFiles(path.resolve(process.cwd(), 'src'));

    expect(apiFiles.length).toBeGreaterThan(0);

    const invalidPaths: Array<{ file: string; path: string }> = [];

    for (const file of apiFiles) {
      const relativeFile = path.relative(process.cwd(), file);
      const endpoints = extractEndpointsFromFile(file);

      for (const endpoint of endpoints) {
        if (!validPaths.has(endpoint)) {
          invalidPaths.push({ file: relativeFile, path: endpoint });
        }
      }
    }

    if (invalidPaths.length > 0) {
      console.error('❌ Mismatched API Paths Found:', invalidPaths);
    }

    expect(invalidPaths).toEqual([]);
  });
});
