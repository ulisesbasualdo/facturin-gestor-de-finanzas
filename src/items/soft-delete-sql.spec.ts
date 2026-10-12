import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Carpeta con el código fuente del backend. */
const SOURCE_DIR = join(import.meta.dirname, '..');

/** Devuelve las rutas de los archivos `.ts` de código (sin specs ni migraciones). */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'migrations' ? [] : sourceFiles(path);
    }
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [path] : [];
  });
}

/** Devuelve el WHERE que sigue a cada `FROM item` del SQL crudo de un archivo. */
function whereClausesAfterFromItem(code: string): string[] {
  return [...code.matchAll(/FROM item\b[\s\S]*?WHERE([\s\S]*?)(?:\)|`|GROUP BY)/g)].map(
    (match) => match[1],
  );
}

describe('SQL crudo sobre la tabla item', () => {
  const queries = sourceFiles(SOURCE_DIR).flatMap((file) =>
    whereClausesAfterFromItem(readFileSync(file, 'utf8')).map((where) => ({
      file: relative(SOURCE_DIR, file),
      where,
    })),
  );

  it('encuentra consultas para revisar', () => {
    expect(queries.length).toBeGreaterThan(0);
  });

  it.each(queries)('excluye los ítems borrados en $file', ({ where }) => {
    expect(where).toMatch(/deletedAt IS NULL/);
  });
});
