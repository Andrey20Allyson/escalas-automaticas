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

  increment(place: string, key: K): number {
    return ++this.counterFrom(place)[key];
  }

  counterFrom(place: string) {
    let counter = this.quantityInPlaces.get(place);

    if (counter === undefined) {
      counter = this.initializer();

      this.quantityInPlaces.set(place, counter);
    }

    return counter;
  }

  decrement(place: string, key: K) {
    return --this.counterFrom(place)[key];
  }

  quantityFrom(place: string, key: K): number {
    return this.quantityInPlaces.get(place)?.[key] ?? 0;
  }
}