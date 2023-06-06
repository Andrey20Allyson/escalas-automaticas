import { ExtraDutyTable } from ".";
import { thisMonthWeekends } from "./utils";
import { WorkerInfo } from "./worker-info";

export class ExtraDutyTableV2 extends ExtraDutyTable {
  assignOnAllWeekEnds(worker: WorkerInfo): boolean {
    const oldDutyMinDistance = this.config.dutyMinDistance;
    this.config.dutyMinDistance = 1;

    for (const weekend of thisMonthWeekends) {
      if (weekend.saturday) {
        const day = this.getDay(weekend.saturday);

        day.fill(worker);
      }
      
      if (weekend.sunday) {
        const day = this.getDay(weekend.sunday);
        
        day.fill(worker);
      }
    }

    this.config.dutyMinDistance = oldDutyMinDistance;

    return worker.isCompletelyBusy();
  }

  assignArrayToAllWeekEnds(workers: WorkerInfo[]): boolean {
    const workersSet = new Set(workers);

    for (const worker of workersSet) {
      this.assignOnAllWeekEnds(worker);

      if (worker.isCompletelyBusy()) workersSet.delete(worker);
    }

    return workersSet.size === 0;
  }
}