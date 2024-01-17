import { QuantityStorage } from "./quantity-storage";
import { WorkerInfo, Gender, Graduation } from "./worker-info";

export class WorkingPlaceStorage {
  private places: Map<string, Map<number, WorkerInfo>>;
  readonly gender: QuantityStorage<Gender>;
  readonly graduation: QuantityStorage<Graduation>;

  constructor() {
    this.places = new Map();

    this.graduation = new QuantityStorage<Graduation>(() => ({
      'sub-insp': 0,
      'insp': 0,
      'gcm': 0,
    }));

    this.gender = new QuantityStorage<Gender>(() => ({
      'female': 0,
      'male': 0,
      'N/A': 0,
    }));
  }

  placeFrom(place: string): ReadonlyMap<number, WorkerInfo> {
    return this._mutPlaceFrom(place);
  }

  sizeOf(place: string) {
    return this.placeFrom(place).size;
  }

  private _mutPlaceFrom(place: string): Map<number, WorkerInfo> {
    let placeMap = this.places.get(place);

    if (placeMap === undefined) {
      placeMap = new Map();

      this.places.set(place, placeMap);
    }

    return placeMap;
  }

  has(workerId: number, place?: string): boolean;
  has(worker: WorkerInfo, place?: string): boolean;
  has(arg0: number | WorkerInfo, place?: string): boolean {
    const id = typeof arg0 === 'number' ? arg0 : this.keyFrom(arg0);

    if (place !== undefined) {
      return this
        .placeFrom(place)
        .has(id);
    }

    for (const [_, place] of this.places) {
      if (place.has(id)) return true;
    }

    return false;
  }

  add(place: string, worker: WorkerInfo): void {
    this._mutPlaceFrom(place).set(this.keyFrom(worker), worker);

    this.graduation.increment(place, worker.graduation);
    this.gender.increment(place, worker.gender);
  }

  remove(place: string, worker: WorkerInfo): boolean {
    const existed = this._mutPlaceFrom(place).delete(this.keyFrom(worker));

    if (!existed) return false;

    this.graduation.decrement(place, worker.graduation);
    this.gender.decrement(place, worker.gender);

    return true;
  }

  copy(storage: WorkingPlaceStorage): this {
    this.clear();

    this.gender.copy(storage.gender);
    this.graduation.copy(storage.graduation);

    for (const [name, place] of storage.places) {
      this.places.set(name, new Map(place));
    }

    return this;
  }

  keyFrom(worker: WorkerInfo): number {
    return worker.fullWorkerID;
  }

  clear(): void {
    this.places.clear();
    this.gender.clear();
    this.graduation.clear();
  }
}