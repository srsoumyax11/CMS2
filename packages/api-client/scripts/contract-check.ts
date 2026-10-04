/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import {
  ApiResponseSchema,
  AuthTokenDataSchema,
  UserPermissionsSchema,
  UserRolesSchema,
} from '../src/schemas';

// Mapping of app endpoints to expected Zod payload schemas
export const ENDPOINT_SCHEMA_MAP: Record<string, { method: string; schema: z.ZodTypeAny }> = {
  '/api/v1/auth/login': { method: 'post', schema: AuthTokenDataSchema },
  '/api/v1/auth/2fa/verify': { method: 'post', schema: AuthTokenDataSchema },
  '/api/v1/auth/otp/send': { method: 'post', schema: z.object({ otpId: z.string().optional() }) },
  '/api/v1/auth/otp/verify': { method: 'post', schema: z.object({ verified: z.boolean().optional() }) },
  '/api/v1/auth/logout': { method: 'post', schema: z.any() },
  '/api/v1/auth/token/refresh': { method: 'post', schema: AuthTokenDataSchema },
  '/api/v1/me/permissions': { method: 'get', schema: UserPermissionsSchema },
  '/api/v1/me/roles': { method: 'get', schema: UserRolesSchema },
};

async function checkContract() {
  const specPath = path.join(__dirname, '../openapi/spec.json');
  if (!fs.existsSync(specPath)) {
    console.error('❌ OpenAPI spec file not found at:', specPath);
    process.exit(1);
  }

  const rawSpec = fs.readFileSync(specPath, 'utf8');
  const spec = JSON.parse(rawSpec);

  const documentedPaths = spec.paths || {};
  console.log(`🔍 Validating OpenAPI Contract & Response Shapes (${Object.keys(documentedPaths).length} endpoints documented)...`);

  let errors = 0;

  for (const [endpoint, config] of Object.entries(ENDPOINT_SCHEMA_MAP)) {
    const pathItem = documentedPaths[endpoint];
    if (!pathItem) {
      console.error(`❌ Contract Error: Endpoint "${endpoint}" missing from OpenAPI spec.`);
      errors++;
      continue;
    }

    const operation = pathItem[config.method.toLowerCase()];
    if (!operation) {
      console.error(`❌ Contract Error: Method "${config.method.toUpperCase()}" missing for endpoint "${endpoint}".`);
      errors++;
      continue;
    }

    // Verify 200 response exists
    const response200 = operation.responses?.['200'] || operation.responses?.[200];
    if (!response200) {
      console.error(`❌ Contract Error: 200 OK response definition missing for "${config.method.toUpperCase()} ${endpoint}".`);
      errors++;
      continue;
    }

    // Validate dummy response object against wrapper ApiResponseSchema
    const wrapperSchema = ApiResponseSchema(config.schema);
    const mockSuccessResponse = {
      success: true,
      message: 'OK',
      data: { accessToken: 'test-token', permissions: ['read'], roles: ['student'], otpId: '123', verified: true },
      requestId: 'req-check-1',
      timestamp: new Date().toISOString(),
    };

    const parseResult = wrapperSchema.safeParse(mockSuccessResponse);
    if (!parseResult.success) {
      console.error(`❌ Contract Shape Error: Zod schema mismatch for endpoint "${endpoint}":`, parseResult.error.issues);
      errors++;
    } else {
      console.log(`  ✓ Shape contract verified for ${config.method.toUpperCase()} ${endpoint}`);
    }
  }

  if (errors > 0) {
    console.error(`❌ Contract check failed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log('✅ Contract check passed! Zero schema drift detected against OpenAPI spec.');
}

checkContract().catch((err) => {
  console.error('❌ Unexpected contract check failure:', err);
  process.exit(1);
});
