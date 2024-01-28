import { DocumentReference, CollectionReference, Query } from "firebase-admin/firestore";
import { WorkerRegistry } from ".";
import { adminFirestore } from "../../../firebase";
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { config } from "../../../config";
import path from "path";

export type WorkerRegistryChunkData = {
  idx: number;
  version: number;
  workers: WorkerRegistry[];
}

export class WorkerRegistryChunk {
  constructor(
    readonly data: WorkerRegistryChunkData,
    private readonly doc: DocumentReference,
  ) { }

  persist() {
    this.data.version++;

    return this.doc.set(this.data);
  }
}

export type GetChunkMode = 'default' | 'only-version';

export type GetChunkResult<M extends GetChunkMode> = M extends 'default' ? {
  doc: DocumentReference;
  data: WorkerRegistryChunkData;
} : {
  doc: DocumentReference;
  version: number;
};

export class WorkerRegistryChunkStorage {
  readonly collection: CollectionReference;

  constructor() {
    this.collection = adminFirestore.collection('worker-registries');
  }

  private fileDirOf(idx: number): string {
    return path.resolve(
      config.registries.cacheDir,
      `worker-registries.chunk-${idx}.json`,
    );
  }

  private async get<M extends GetChunkMode = 'default'>(idx: number, mode: M = 'default' as M): Promise<GetChunkResult<M>> {
    let query = this.collection
      .where('type', '==', 'registry-chunk')
      .where('idx', '==', idx)
      .limit(1);

    if (mode === 'only-version') {
      query = query.select('version');
    }

    const snapshot = await query
      .get()
      .then(query => query.docs.at(0) ?? Promise.reject(new Error(`Can't find chunk with idx ${idx}`)));

    if (mode === 'only-version') {
      return {
        version: snapshot.data().version,
        doc: snapshot.ref,
      } as GetChunkResult<M>;
    }

    return {
      data: snapshot.data(),
      doc: snapshot.ref,
    } as GetChunkResult<M>;
  }

  async at(idx: number): Promise<WorkerRegistryChunk> {
    const cache = await readFile(this.fileDirOf(idx), { encoding: 'utf-8' })
      .then(buffer => JSON.parse(buffer) as WorkerRegistryChunkData)
      .catch(() => null);

    const { doc, version: latestVersion } = await this.get(idx, 'only-version');
    if (cache !== null && cache.version >= latestVersion) return new WorkerRegistryChunk(cache, doc);

    const { data } = await this.get(idx);

    await access(config.registries.cacheDir)
      .catch(() => mkdir(config.registries.cacheDir, { recursive: true }));

    await writeFile(this.fileDirOf(idx), JSON.stringify(data));

    return new WorkerRegistryChunk(data, doc);
  }
}