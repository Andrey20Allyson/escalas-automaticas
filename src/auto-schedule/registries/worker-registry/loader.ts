import { WorkerRegistry } from ".";
import { Loader } from "../loader";
import { ChunkNotFoundError, WorkerRegistryChunkStorage } from "./chunk-storage";

export interface FirebaseWorkerRegistryLoaderOptions {
  cacheOnly?: boolean;
}

export class FirebaseWorkerRegistryLoader implements Loader<WorkerRegistry[]> {
  readonly storage: WorkerRegistryChunkStorage;
  readonly cacheOnly: boolean;

  constructor(options?: FirebaseWorkerRegistryLoaderOptions) {
    this.storage = new WorkerRegistryChunkStorage();

    this.cacheOnly = options?.cacheOnly ?? false;
  }

  async load(): Promise<WorkerRegistry[]> {
    if (this.cacheOnly) {
      const chunk = await this.storage
        .fromCache(0)
        .then(chunk => chunk ?? ChunkNotFoundError.reject(0));

      return chunk.registries();
    }

    const chunk = await this.storage.get(0);

    return chunk.registries();
  }
}