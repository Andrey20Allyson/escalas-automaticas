import { WorkerRegistry } from ".";
import { ResultError, ResultType } from "../../../utils";

export class WorkerRegistryStorage {
  private readonly map: Map<string, WorkerRegistry>;

  constructor(registries: Iterable<WorkerRegistry>) {
    const entries = Array.from(registries).map(registry => [registry.workerId, registry] as const)
  
    this.map = new Map(entries);
  }

  get(id: string, name?: string): ResultType<WorkerRegistry> {
    return this.map.get(id) ?? new ResultError(`Can't find the registry of worker with id "${id}"${name !== undefined ? ` and name "${name}"` : ''}.`);
  }
}