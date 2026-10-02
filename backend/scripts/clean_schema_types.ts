import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const sqlPath = resolve(__dirname, '../../campus_schema.sql');
let sql = readFileSync(sqlPath, 'utf8');

// Replace custom domains with native Postgres types
sql = sql.replace(/\bpk_uuid\b/g, 'uuid DEFAULT gen_random_uuid()');
sql = sql.replace(/\bamount_t\b/g, 'numeric(12,2)');
sql = sql.replace(/\bphone_t\b/g, 'text');
sql = sql.replace(/\blat_t\b/g, 'numeric(9,6)');
sql = sql.replace(/\blng_t\b/g, 'numeric(9,6)');
sql = sql.replace(/\bcitext\b/g, 'text');

writeFileSync(sqlPath, sql, 'utf8');
console.log('Successfully updated campus_schema.sql to use standard PostgreSQL types!');
