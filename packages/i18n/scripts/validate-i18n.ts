import * as fs from 'node:fs';
import * as path from 'node:path';

type JsonObject = { [key: string]: string | JsonObject };

function getEntries(obj: JsonObject, prefix = ''): Array<{ key: string; value: string }> {
  let entries: Array<{ key: string; value: string }> = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      entries = entries.concat(getEntries(value as JsonObject, fullKey));
    } else if (typeof value === 'string') {
      entries.push({ key: fullKey, value });
    }
  }
  return entries;
}

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  return matches ? matches.sort() : [];
}

const localesDir = path.join(__dirname, '../src/locales');
const enFile = path.join(localesDir, 'en.json');
const hiFile = path.join(localesDir, 'hi.json');
const orFile = path.join(localesDir, 'or.json');

const en = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
const hi = JSON.parse(fs.readFileSync(hiFile, 'utf-8'));
const or = JSON.parse(fs.readFileSync(orFile, 'utf-8'));

const enEntries = getEntries(en);
const hiMap = new Map(getEntries(hi).map((e) => [e.key, e.value]));
const orMap = new Map(getEntries(or).map((e) => [e.key, e.value]));

let hasErrors = false;

for (const { key, value: enVal } of enEntries) {
  if (!enVal.trim()) {
    /* eslint-disable-next-line no-console */
    console.error(`❌ Empty value in en.json for key: ${key}`);
    hasErrors = true;
  }

  const enPlaceholders = extractPlaceholders(enVal);

  // Check Hindi
  const hiVal = hiMap.get(key);
  if (hiVal === undefined) {
    /* eslint-disable-next-line no-console */
    console.error(`❌ Missing Hindi key: ${key}`);
    hasErrors = true;
  } else {
    if (!hiVal.trim()) {
      /* eslint-disable-next-line no-console */
      console.error(`❌ Empty value in hi.json for key: ${key}`);
      hasErrors = true;
    }
    const hiPlaceholders = extractPlaceholders(hiVal);
    if (JSON.stringify(enPlaceholders) !== JSON.stringify(hiPlaceholders)) {
      /* eslint-disable-next-line no-console */
      console.error(`❌ Mismatched placeholders for key "${key}" in Hindi. Expected ${enPlaceholders.join(', ')} but got ${hiPlaceholders.join(', ')}`);
      hasErrors = true;
    }
    if (hiVal.trim() === enVal.trim() && enVal.length > 3) {
      /* eslint-disable-next-line no-console */
      console.warn(`⚠️ Warning: Hindi value for "${key}" is identical to English value ("${enVal}")`);
    }
  }

  // Check Odia
  const orVal = orMap.get(key);
  if (orVal === undefined) {
    /* eslint-disable-next-line no-console */
    console.error(`❌ Missing Odia key: ${key}`);
    hasErrors = true;
  } else {
    if (!orVal.trim()) {
      /* eslint-disable-next-line no-console */
      console.error(`❌ Empty value in or.json for key: ${key}`);
      hasErrors = true;
    }
    const orPlaceholders = extractPlaceholders(orVal);
    if (JSON.stringify(enPlaceholders) !== JSON.stringify(orPlaceholders)) {
      /* eslint-disable-next-line no-console */
      console.error(`❌ Mismatched placeholders for key "${key}" in Odia. Expected ${enPlaceholders.join(', ')} but got ${orPlaceholders.join(', ')}`);
      hasErrors = true;
    }
    if (orVal.trim() === enVal.trim() && enVal.length > 3) {
      /* eslint-disable-next-line no-console */
      console.warn(`⚠️ Warning: Odia value for "${key}" is identical to English value ("${enVal}")`);
    }
  }
}

if (hasErrors) {
  /* eslint-disable-next-line no-console */
  console.error('❌ i18n validation failed! Fix translation errors above.');
  process.exit(1);
} else {
  /* eslint-disable-next-line no-console */
  console.log('✅ i18n validation passed! All placeholders, keys, and values are verified across en, hi, and or.');
}
