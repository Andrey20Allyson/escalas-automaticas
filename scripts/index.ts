import { program } from 'commander';

const buildCommand = program
  .command('build')
  .description('clear dist/ and builds the program')
  .option('-c, --clear [yes|no]', '', value => {
    switch (value) {
      case 'y':
      case 'yes':
        return true;
      case 'n':
      case 'no':
        return false;
      default:
        throw new Error(`--clear expects 'yes' or 'no', recived '${value}'`);
    }
  }, true)
  .action(async () => {
    const lib = await import('./actions/build');

    const clearOption: boolean = buildCommand.getOptionValue('clear');

    lib.build(clearOption);
  });

program.parse();