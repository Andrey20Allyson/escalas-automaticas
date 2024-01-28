import { WorkerRegistry } from ".";
import { Loader, LoaderOptions } from "../loader";
import { WorkerRegistryChunkStorage } from "./chunk";

export class FirebaseWorkerRegistryLoader implements Loader<WorkerRegistry[]> {
  
  readonly storage: WorkerRegistryChunkStorage;

  constructor() {
    this.storage = new WorkerRegistryChunkStorage();
  }

  async load(options?: LoaderOptions): Promise<WorkerRegistry[]> {
    const chunk = await this.storage.at(0);

    return chunk.data.workers;
  }
}