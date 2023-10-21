import { remove } from '../utils/fs';
import { asyncExec } from '../utils/child_process';

export async function build(execClear: boolean = true) {
  if (execClear) {
    console.log('cleaning \'dist/\'...');
    await remove('dist/');
  }

  console.log('building \'dist/\'...');
  await asyncExec('npx tsc');

  console.log('resolving aliases...');
  await asyncExec('npx tsc-alias');

  await remove('dist/test/');
}