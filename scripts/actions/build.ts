import { remove } from '../utils/fs';
import { asyncExec } from '../utils/child_process';

export async function build(execClear: boolean = true) {
  if (execClear) {
    console.log('cleaning \'dist/\'...');
    await remove('dist/');
  }

  console.log('building \'dist/\'...');
  await asyncExec('npx tsc');

  await remove('dist/test/');
}