import clone from "clone";
import { Query, QueryDocumentSnapshot, QuerySnapshot } from "firebase-admin/firestore";
import fs from 'fs/promises';
import { WorkerRegistry, WorkerRegistryInit } from ".";
import { config } from "../../../config";
import { adminFirestore } from "../../../firebase";
import { ChunkNotFoundError, WorkerRegistryChunkStorage } from "./chunk-storage";

export type WorkerRegistryChunkData = {
  readonly idx: number;
  readonly type: string;
  workers: WorkerRegistry[];
  version: number;
};

export type WorkerRegistryChunkVersion = {
  version: number;
}

export type RegistryChangeInfo = {
  readonly registry: WorkerRegistry;
};

export class WorkerRegistryChunk {
  private _updates: Map<string, WorkerRegistry> = new Map();
  private _remotions: Set<string> = new Set();
  private _insertions: Map<string, WorkerRegistry> = new Map();
  private _data: WorkerRegistryChunkData;

  constructor(
    data: WorkerRegistryChunkData,
    readonly storage: WorkerRegistryChunkStorage,
  ) {
    this._data = clone(data);
  }

  index() {
    return this._data.idx;
  }

  type() {
    return this._data.type;
  }

  version() {
    return this._data.version;
  }

  update(registry: WorkerRegistry): this {
    this._updates.set(registry.workerId, {
      ...registry,
      createdAtVersion: this.version(),
    });

    return this;
  }

  add(registry: WorkerRegistryInit): this {
    this._insertions.set(registry.workerId, {
      ...registry,
      createdAtVersion: this.version(),
    });

    return this;
  }

  delete(id: string): this {
    if (this._insertions.has(id)) {
      this._insertions.delete(id);
    }

    this._remotions.add(id);

    return this;
  }

  registries(): WorkerRegistry[];
  registries(oldRegistries: WorkerRegistry[]): WorkerRegistry[];
  registries(oldRegistries?: WorkerRegistry[]): WorkerRegistry[] {
    const registries = oldRegistries ?? this._data.workers;

    return registries
      .filter(registry => this._remotions.has(registry.workerId) === false || this._data.version < registry.createdAtVersion)
      .concat(Array.from(this._insertions.values()))
      .map(registry => this._data.version < registry.createdAtVersion ? registry : (this._updates.get(registry.workerId) ?? registry));
  }

  snapshot(): Promise<QueryDocumentSnapshot<WorkerRegistryChunkData>>;
  snapshot(querySnapshot: QuerySnapshot<WorkerRegistryChunkData>): Promise<QueryDocumentSnapshot<WorkerRegistryChunkData>>;
  async snapshot(querySnapshot?: QuerySnapshot<WorkerRegistryChunkData>): Promise<QueryDocumentSnapshot<WorkerRegistryChunkData>> {
    const _querySnapshot = querySnapshot ?? await this.query().get();

    return _querySnapshot.docs.at(0) ?? ChunkNotFoundError.reject(this._data.idx);
  }

  async reload(): Promise<void> {
    const doc = await this.snapshot();

    this._data = doc.data();
  }

  query(): Query<WorkerRegistryChunkData> {
    return this.storage.collection
      .where('type', '==', this._data.type)
      .where('idx', '==', this._data.idx)
      .limit(1) as Query<WorkerRegistryChunkData>;
  }

  async cache(): Promise<void> {
    await fs.access(config.registries.cacheDir)
      .catch(() => fs.mkdir(config.registries.cacheDir, { recursive: true }));

    await fs.writeFile(this.storage.cacheDirOf(this._data.idx), JSON.stringify(this._data));
  }

  changed(): boolean {
    return this._insertions.size > 0
      || this._remotions.size > 0
      || this._updates.size > 0;
  }

  clearChanges() {
    this._insertions.clear();
    this._updates.clear();
    this._remotions.clear();
  }

  async persist(): Promise<void> {
    if (this.changed() === false) return;

    await adminFirestore.runTransaction(async transaction => {
      const doc = await transaction
        .get(this.query())
        .then(qs => this.snapshot(qs));

      const data = doc.data();

      const newData: WorkerRegistryChunkData = {
        idx: data.idx,
        type: data.type,
        version: data.version + 1,
        workers: this.registries(data.workers),
      };

      this._data = newData;
      this.clearChanges();

      transaction.set(doc.ref, newData);
    });

    await this.cache();
  }
}