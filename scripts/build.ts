import { clear } from './clear';
import { asyncExec } from './utils/child_process';

export async function build(execClear: boolean = true) {
  if (execClear) {
    console.log('cleaning \'dist/\'...');
    await clear();
  }

  console.log('building \'dist/\'...')
  await asyncExec('tsc');
}