/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

async function syncApiSpec() {
  const targetPath = path.join(__dirname, '../openapi/spec.json');
  const swaggerUrl = process.env.SWAGGER_URL || 'http://localhost:3000/swagger/json';

  console.log(`🌐 Syncing OpenAPI spec from ${swaggerUrl}...`);

  try {
    const res = await fetch(swaggerUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch spec: ${res.status} ${res.statusText}`);
    }

    const specJson = await res.json();
    fs.writeFileSync(targetPath, JSON.stringify(specJson, null, 2), 'utf8');
    console.log(`✅ Updated OpenAPI spec saved to ${targetPath}`);
  } catch {
    console.warn(`⚠️ Could not reach running backend at ${swaggerUrl}. Preserving existing spec.json.`);
    if (process.env.CI) {
      console.error('❌ In CI environment, live backend fetch failed.');
      process.exit(1);
    }
  }
}

syncApiSpec();
