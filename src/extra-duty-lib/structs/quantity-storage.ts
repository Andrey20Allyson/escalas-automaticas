export class QuantityStorage<K extends keyof any> {
  private quantityInPlaces: Map<string, Record<K, number>>;

  constructor(
    private initializer: () => Record<K, number>,
  ) {
    this.quantityInPlaces = new Map();
  }

  copy(storage: QuantityStorage<K>) {
    this.clear();

    for (const [place, record] of storage.quantityInPlaces) {
      this.quantityInPlaces.set(place, { ...record });
    }
  }

  clear() {
    this.quantityInPlaces.clear();
  }

  reset(place: string, key?: K) {
    let counter = this.quantityInPlaces.get(place);
    if (counter === undefined) return;

    if (key === undefined) {
      this.quantityInPlaces.delete(place);
      return;
    }

    counter[key] = this.initializer()[key];
  }

  increment(place: string, key: K, count = 1): number {
    const record = this.counterFrom(place);

    if (key in record === false) {
      record[key] = 0;
    }

    return record[key] += count;
  }

  decrement(place: string, key: K, count = 1): number {
    const record = this.counterFrom(place);

    if (key in record === false) {
      record[key] = 0;
    }

    return record[key] -= count;
  }

  counterFrom(place: string) {
    let counter = this.quantityInPlaces.get(place);

    if (counter === undefined) {
      counter = this.initializer();

      this.quantityInPlaces.set(place, counter);
    }

    return counter;
  }

  quantityFrom(place: string, key: K): number {
    return this.quantityInPlaces.get(place)?.[key] ?? 0;
  }
}