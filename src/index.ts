import { program } from 'commander';
import { analyseResult } from './analyser';
import { Benchmarker } from './extra-duty-table/utils/benchmark';
import { ExtraDutyTableV2 } from './extra-duty-table/v2';
import { loadWorkers, saveTable } from './io';
import z from 'zod';

interface ExecutionOptions {
  input: string;
  output?: string;
  sheetName?: string;
  analyse?: boolean;
  benchmark?: boolean;
  sortByName?: boolean;
}

async function execute(options: ExecutionOptions) {
  const benchmarker = new Benchmarker();
  const programProcess = benchmarker.start('full process');

  // loads workers from specified file
  const loadWorkersProcess = benchmarker.start('load workers from file');
  const workers = await loadWorkers(options.input, options.sheetName);
  loadWorkersProcess.end();

  // assign workers to table
  const assignArrayProcess = benchmarker.start('assign workers to table');
  const table = new ExtraDutyTableV2();
  table.assignArray(workers);
  assignArrayProcess.end();

  if (options.analyse) {
    // analyse the result
    const analysisProcess = benchmarker.start('analyse result');
    const analysisResult = analyseResult(table, workers);
    console.log(analysisResult);
    analysisProcess.end();
  }

  if (options.output) {
    // saves the result
    const saveTableProcess = benchmarker.start('save table inside a file');
    await saveTable(options.output, table);
    saveTableProcess.end();
  }

  programProcess.end();

  if (options.benchmark) {
    const benchmarkMessage = benchmarker.getMessage();
    console.log(benchmarkMessage);
  }
}

const programOptionsSchema = z.object({
  output: z.string().optional(),
  analyse: z.boolean(),
  benchmark: z.boolean(),
  sheetName: z.string().optional(),
  hourly: z.string().optional(),
  names: z.string().optional(),
  sortByName: z.boolean(),
})

type ProgramOptions = z.infer<typeof programOptionsSchema>;

async function main() {
  program.option('-o, --output <path>', 'output file');
  program.option('-a, --analyse', 'analyse result', false);
  program.option('-b, --benchmark', 'benchmark the process', false);
  program.option('-n, --names <string>', 'the cells sequence that contain worker names');
  program.option('-h, --hourly <string>', 'the cells sequence that contain worker hourly');
  program.option('-s, --sheetName <string>', 'the excel sheet with data');
  program.option('--sortByName', 'sort the result by worker name', false);

  program.parse();

  const {
    sortByName,
    sheetName,
    benchmark,
    analyse,
    output,
  } = programOptionsSchema.parse(program.opts());

  const input = program.args.at(0);

  if (!input) throw new Error(`Can't initialize because this program needs a input file`);

  await execute({
    sortByName,
    sheetName,
    benchmark,
    analyse,
    output,
    input,
  });
}

main();