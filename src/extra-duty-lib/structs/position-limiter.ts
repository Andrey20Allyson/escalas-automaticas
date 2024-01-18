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
    
    return workerPositions + this.config.dutyPositionSize >= limitable.limit.of(this.config.currentPlace);
  }

  positionsOf(identifiable: Identifiable): number {
    return this.places.quantityFrom(this.config.currentPlace, identifiable.id);
  }

  positionsLeftOf(limitable: Limitable): number {
    return limitable.limit.of(this.config.currentPlace) - this.positionsOf(limitable);
  }

  increase(identifiable: Identifiable): number {
    return this.places.increment(this.config.currentPlace, identifiable.id, this.config.dutyPositionSize);
  }

  decrease(identifiable: Identifiable): number {
    return this.places.decrement(this.config.currentPlace, identifiable.id, this.config.dutyPositionSize);
  }

  reset(identifiable: Identifiable) {
    return this.places.reset(this.config.currentPlace, identifiable.id);
  }

  clear(place?: string): void {
    if (place !== undefined) {
      this.places.reset(place);
      
      return;
    }
    
    this.places.clear();
  }
}