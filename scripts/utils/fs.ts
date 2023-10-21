import fs from 'fs/promises';

export async function remove(path: string) {
  await fs.rm(path, { recursive: true, force: true });
}