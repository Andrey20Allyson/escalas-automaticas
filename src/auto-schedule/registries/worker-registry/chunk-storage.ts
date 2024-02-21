import { CollectionReference, Query, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { readFile } from "fs/promises";
import path from "path";
import { config } from "../../../config";
import { adminFirestore } from "../../../firebase";
import { WorkerRegistryChunk, WorkerRegistryChunkData } from "./chunk";

export class ChunkNotFoundError extends Error {
  constructor(idx: number) {
    super(`Can't find worker-registry chunk with index #${idx}`);
  }

  static reject(idx: number): Promise<never> {
    return Promise.reject(new ChunkNotFoundError(idx))
  }
}

export class WorkerRegistryChunkStorage {
  readonly collection: CollectionReference;

  constructor() {
    this.collection = adminFirestore.collection('worker-registries');
  }

  cacheDirOf(idx: number): string {
    return path.resolve(
      config.registries.cacheDir,
      `worker-registries.chunk-${idx}.json`,
    );
  }

  query(idx: number): Query<WorkerRegistryChunkData> {
    return this.collection
      .where('type', '==', 'registry-chunk')
      .where('idx', '==', idx)
      .limit(1) as Query<WorkerRegistryChunkData>;
  }

  async versionOf(idx: number): Promise<number> {
    const doc = await this
      .query(idx)
      .select('version')
      .get()
      .then(snapshot => snapshot.docs.at(0) ?? ChunkNotFoundError.reject(idx)) as QueryDocumentSnapshot<WorkerRegistryChunkData>;

    return doc.data().version;
  }

  async fromDB(idx: number): Promise<WorkerRegistryChunk> {
    const snapshot = await this
      .query(idx)
      .get()
      .then(query => query.docs.at(0) ?? ChunkNotFoundError.reject(idx));

    const data = snapshot.data();

    return new WorkerRegistryChunk(data, this);
  }

  async fromCache(idx: number): Promise<WorkerRegistryChunk | null> {
    return readFile(this.cacheDirOf(idx), { encoding: 'utf-8' })
      .then(buffer => {
        const data = JSON.parse(buffer)

        return new WorkerRegistryChunk(data, this);
      })
      .catch(() => null);
  }

  async get(idx: number): Promise<WorkerRegistryChunk> {
    const cache = await this.fromCache(idx);

    if (cache !== null) {
      const latestVersion = await this.versionOf(idx);

      if (cache.version() >= latestVersion) return cache;
    } 

    const chunk = await this.fromDB(idx);

    await chunk.cache();

    return chunk;
  }
}