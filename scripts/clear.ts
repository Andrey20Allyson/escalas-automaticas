import fs from 'fs/promises';

export async function clear() {
  await fs.rm('dist', { recursive: true, force: true });
}