import { ExtraDutyTable, ExtraDutyTableConfig } from "./extra-duty-table";
import { Identifiable } from "./identifiable";
import { Limitable } from "./limitable";
import { QuantityStorage } from "./quantity-storage";

export class PositionLimiter {
  private places: QuantityStorage<number>;
  readonly config: ExtraDutyTableConfig;

  constructor(
    readonly table: ExtraDutyTable,
  ) {
    this.config = table.config;
    this.places = new QuantityStorage<number>(() => ({}));
  }

  isLimitOut(limitable: Limitable): boolean {
    const workerPositions = this.places.quantityFrom(this.config.currentPlace, limitable.id);
    
    return workerPositions + this.config.dutyPositionSize > limitable.limit.of(this.config.currentPlace);
  }

  positionsOf(identifiable: Identifiable): number {
    return this.places.quantityFrom(this.config.currentPlace, identifiable.id);
  }

  positionsLeftOf(limitable: Limitable): number {
    return limitable.limit.of(this.config.currentPlace) - this.positionsOf(limitable);
  }

  increase(identifiable: Identifiable): number {
    return this.increaseFrom(this.config.currentPlace, identifiable);
  }

  increaseFrom(place: string, identifiable: Identifiable): number {
    return this.places.increment(place, identifiable.id, this.config.dutyPositionSize);
  }

  decrease(identifiable: Identifiable): number {
    return this.decreaseFrom(this.config.currentPlace, identifiable);
  }

  decreaseFrom(place: string, identifiable: Identifiable): number {
    return this.places.decrement(place, identifiable.id, this.config.dutyPositionSize);
  }

  set(identifiable: Identifiable, value: number): this {
    this.places.counterFrom(this.config.currentPlace)[identifiable.id] = value;
    return this;
  }

  copy(otherLimiter: PositionLimiter) {
    this.places.copy(otherLimiter.places);
  }

  reset(identifiable: Identifiable): this {
    this.places.reset(this.config.currentPlace, identifiable.id);
    return this;
  }

  clear(place?: string): void {
    if (place !== undefined) {
      this.places.reset(place);
      
      return;
    }
    
    this.places.clear();
  }
}