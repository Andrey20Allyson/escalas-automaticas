import zod from 'zod';
import { ResultError, ResultType } from '../../utils';
import { BookHandler } from '../../xlsx-handlers/book';
import { CellHandler } from '../../xlsx-handlers/cell';
import { LineHander } from '../../xlsx-handlers/line';

const registriesCollumns = LineHander.collumnTuple([
  'c', // worker id
  'd', // individual id
]);

const registriesCellTypes = CellHandler.typeTuple([
  'string', // workder id cell type
  'string', // individual id cell type
]);

const pointRGX = /\./g;

export interface ScrappeRegistriesOptions {
  sheetName?: string;
}

export const WORKER_REGISTRIES_SCHEMA = zod.object({
  workerID: zod.string(),
  individualID: zod.string(),
});

export interface WorkerRegistries extends zod.infer<typeof WORKER_REGISTRIES_SCHEMA> { }

function workerRegistriesToEntry(registries: WorkerRegistries): [string, WorkerRegistries] {
  return [registries.workerID, registries];
}

function normalizeWorkerRegistries(registries: WorkerRegistries): WorkerRegistries {
  return {
    individualID: registries.individualID,
    workerID: registries.workerID.replace(pointRGX, ''),
  };
}

export class WorkerRegistriesMap {
  private map: Map<string, WorkerRegistries>;
  
  constructor(entries: WorkerRegistries[]) {
    this.map = new Map(entries.map(workerRegistriesToEntry));
  }

  get(workerID: string): ResultType<WorkerRegistries> {
    return this.map.get(workerID) ?? new ResultError(`Can't find workerID "${workerID}"`); 
  }

  has(workerID: string) {
    return this.map.has(workerID);
  }

  static fromJSON(data: unknown): ResultType<WorkerRegistriesMap> {
    const result = WORKER_REGISTRIES_SCHEMA.array().safeParse(data);

    if (!result.success) return ResultError.create(result.error);

    const outputData: WorkerRegistries[] = result.data.map(normalizeWorkerRegistries);

    return new this(outputData);
  }

  static parseJSON(buffer: Buffer): ResultType<WorkerRegistriesMap> {
    try {
      const data = JSON.parse(buffer.toString('utf-8'));
  
      const result = this.fromJSON(data);

      return result;
    } catch (e) {
      return ResultError.create(e);
    }
  }

  static parseXLSX(buffer: Buffer, options: ScrappeRegistriesOptions = {}): ResultType<WorkerRegistriesMap> {
    const book = BookHandler.parse(buffer);
  
    const sheet = book.safeGetSheet(options.sheetName);
    if (ResultError.isError(sheet)) return sheet;
  
    const registries: WorkerRegistries[] = [];
  
    for (const [_line, cells] of LineHander.safeIterCells(sheet.iterLines(3), registriesCollumns)) {
      if (ResultError.isError(cells)) return cells;
  
      const typedCells = CellHandler.safeTypeAll(cells, registriesCellTypes);
      if (ResultError.isError(typedCells)) return typedCells;
  
      const [workerIDCell, individualIDCell] = typedCells;
  
      registries.push({
        individualID: individualIDCell.value,
        workerID: workerIDCell.value.replace(pointRGX, ''),
      });
    }
  
    return new this(registries);
  }
}
