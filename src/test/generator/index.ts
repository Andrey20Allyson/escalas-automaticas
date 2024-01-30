import { program } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { parseWorkers } from '../../auto-schedule/io';
import { FirebaseWorkerRegistryLoader } from '../../auto-schedule/registries/worker-registry/loader';
import { MainTableFactory } from '../../auto-schedule/table-factories';
import { ExtraDutyTable, WorkerInfo } from '../../extra-duty-lib';
import { DefautlScheduleBuilder } from '../../extra-duty-lib/builders/default-builder';
import { DefaultTableIntegrityAnalyser } from '../../extra-duty-lib/builders/integrity';
import { DEFAULT_MONTH_PARSER, Month } from '../../extra-duty-lib/structs/month';
import { Benchmarker, analyseResult } from '../../utils';
import { OptionInfoBuilder, loadCommand } from './cli';
import { MockFactory } from './mock';
import { RandomWorkerMockFactory } from './mock/worker/random';

function mockWorkers(year: number, month: number) {
  const workerMocker: MockFactory<WorkerInfo> = new RandomWorkerMockFactory({ month, year });

  return workerMocker.array(28);
}

async function loadWorkers(year: number, month: number, inputFile: string) {
  const inputBuffer = await fs.readFile(inputFile);
  const loader = new FirebaseWorkerRegistryLoader({ cacheOnly: true });
  const workerRegistries = await loader.load();

  return parseWorkers(inputBuffer, {
    workerRegistries,
    month,
    year,
  });
}

export async function generate(options: GenerateCommandOptions = {}) {
  const {
    mode = options.input !== undefined ? 'input-file' : 'mock',
    input: inputFile = 'input/data.xlsx',
    tries = 7000,
    output: outputFile,
    date: month = Month.now(),
  } = options;

  const beckmarker = new Benchmarker();

  const workers = mode === 'mock'
    ? mockWorkers(month.year, month.index)
    : await loadWorkers(month.year, month.index, inputFile);

  const table = new ExtraDutyTable({
    year: month.year,
    month: month.index,
  });

  const tableAssignBenchmark = beckmarker.start('talbe assign');

  const builder = new DefautlScheduleBuilder(tries);

  builder.build(table, workers);

  tableAssignBenchmark.end();

  const analisysString = analyseResult(table);
  console.log(analisysString);

  const benchmarkString = beckmarker.getMessage();
  console.log(benchmarkString);

  const integrity = new DefaultTableIntegrityAnalyser()
    .analyse(table);

  console.log(integrity);
  console.log(`pode ser utilizado: ${integrity.isCompliant()}`);

  if (outputFile) {
    const pattern = await fs.readFile('input/output-pattern.xlsx');

    const factory = new MainTableFactory(pattern);

    const outBuffer = await factory.generate(table, { sheetName: 'DADOS' });

    const outputFileWithExt = path.extname(outputFile) === '.xlsx'
      ? outputFile
      : outputFile + '.xlsx';

    fs.writeFile(path.resolve(outputFileWithExt), outBuffer);
  }
}

const generateOptionsSchema = z.object({
  mode: z
    .enum(['input-file', 'mock'])
    .optional(),
  input: z
    .string()
    .optional(),
  output: z
    .string()
    .optional(),
  tries: z
    .number({ coerce: true })
    .optional(),
  date: z
    .string()
    .transform(s => DEFAULT_MONTH_PARSER.parse(s))
    .optional(),
});

export type GenerateCommandOptions = z.infer<typeof generateOptionsSchema>;

loadCommand({
  schema: generateOptionsSchema,
  command: 'generate',
  aliases: ['gen', 'g'],
  description: `Generates a extra schedule`,
  optionInfos: {
    date: OptionInfoBuilder
      .alias('d')
      .describe('the month of extra duty table'),
    input: OptionInfoBuilder
      .alias('i')
      .describe('the input file path'),
    output: OptionInfoBuilder
      .alias('o')
      .describe('the output file path'),
    tries: OptionInfoBuilder
      .alias('t')
      .describe('the number of times that the program will try generate the table'),
    mode: OptionInfoBuilder
      .alias('m')
      .describe('select the execution mode'),
  },
  action: generate,
});

program.parse();