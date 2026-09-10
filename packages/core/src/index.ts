export type InferredType = 'TEXT'|'NUMBER'|'BOOLEAN'|'DATE'|'DATETIME'|'EMAIL'|'URL'|'TAGS'|'JSON';

const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const url=/^https?:\/\//i;

export function inferValueType(values: unknown[]): InferredType {
  const present = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  if (!present.length) return 'TEXT';
  if (present.every(v => typeof v === 'boolean' || /^(true|false)$/i.test(String(v)))) return 'BOOLEAN';
  if (present.every(v => !Number.isNaN(Number(v)))) return 'NUMBER';
  if (present.every(v => email.test(String(v)))) return 'EMAIL';
  if (present.every(v => url.test(String(v)))) return 'URL';
  if (present.every(v => !Number.isNaN(Date.parse(String(v))))) return 'DATETIME';
  if (present.every(v => typeof v === 'object')) return 'JSON';
  return 'TEXT';
}

export function inferSchema(rows: Record<string, unknown>[]) {
  const keys = [...new Set(rows.flatMap(r => Object.keys(r)))];
  return keys.map((key, position) => ({ key: slugify(key), label: key, type: inferValueType(rows.map(r => r[key])), position }));
}

export function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9\u0600-\u06ff]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'collection';
}
