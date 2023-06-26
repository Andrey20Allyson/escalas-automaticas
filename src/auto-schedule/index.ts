import { Holidays } from '../extra-duty-table';
import { ExtraDutyTableV2 } from '../extra-duty-table/v2';
import { WorkerRegistriesMap } from '../extra-duty-table/worker-registries';
import { getMonth } from '../utils';
import { analyseResult } from '../utils/analyser';
import { Benchmarker } from '../utils/benchmark';
import { loadWorkers, parseWorkers, saveTable, serializeTable } from './io';
import { MainTableFactory } from './table-factories/main-factory';

export interface ExecutionOptions {
  input: string;
  output?: string;
  sheetName?: string;
  month?: number;
  analyse?: boolean;
  benchmark?: boolean;
  sortByName?: boolean;
  tries?: number;
}

/**
 * Server environment only
 * @deprecated
 */
export async function execute(options: ExecutionOptions) {
  const month = options.month ?? getMonth();

  const benchmarker = new Benchmarker();
  const programProcess = benchmarker.start('full process');

  // loads workers from specified file
  const loadWorkersProcess = benchmarker.start('load workers from file');
  const workers = await loadWorkers(options.input, { ...options, month });
  loadWorkersProcess.end();

  // assign workers to table
  const assignArrayProcess = benchmarker.start('assign workers to table');
  const table = new ExtraDutyTableV2();
  const success = table.tryAssignArrayMultipleTimes(workers, options.tries ?? 500);
  if (!success) throw new Error(`Can't assign with success!`);
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

export interface GenerateOptions {
  patternData?: Buffer;
  month?: number;
  tries?: number;
  holidays?: Holidays;
  sortByName?: boolean;
  benchmarker?: Benchmarker;
  inputSheetName?: string;
  outputSheetName?: string;
  workerRegistryMap?: WorkerRegistriesMap;

  onAnalyse?: (message: string) => void;
}

export async function generate(data: Buffer, options: GenerateOptions = {}): Promise<Buffer> {
  const month = options.month ?? getMonth();
  
  const workersParseProcess = options.benchmarker?.start('parse workers');
  const workers = parseWorkers(data, {
    workerRegistryMap: options.workerRegistryMap,
    sheetName: options.inputSheetName,
    holidays: options.holidays,
    month,
  });
  workersParseProcess?.end();

  const assignArrayProcess = options.benchmarker?.start('assign workers to table');
  const table = new ExtraDutyTableV2({ month });
  table.tryAssignArrayMultipleTimes(workers, options.tries ?? 500);
  assignArrayProcess?.end();

  if (options.onAnalyse) {
    const analysisResult = analyseResult(table, workers);
    options.onAnalyse(analysisResult);
  }
  
  const serializeTableProcess = options.benchmarker?.start('serialize table');
  const serializationPattern = options.patternData && new MainTableFactory(options.patternData);
  const serializedTable = await serializeTable(table, {
    sheetName: options.outputSheetName ?? 'Main',
    pattern: serializationPattern,
  });
  serializeTableProcess?.end();

  return serializedTable;
}