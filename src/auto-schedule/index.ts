import { analyseResult } from './analyser';
import { Benchmarker } from '../utils/benchmark';
import { ExtraDutyTableV2 } from '../extra-duty-table/v2';
import { loadWorkers, saveTable } from './io';

export interface ExecutionOptions {
  input: string;
  output?: string;
  sheetName?: string;
  analyse?: boolean;
  benchmark?: boolean;
  sortByName?: boolean;
}

export async function execute(options: ExecutionOptions) {
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