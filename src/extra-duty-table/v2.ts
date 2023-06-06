import { ExtraDutyTable } from ".";
import { thisMonthWeekends } from "./utils";
import { WorkerInfo } from "./worker-info";

export class ExtraDutyTableV2 extends ExtraDutyTable {
  assignOnAllWeekEnds(worker: WorkerInfo, distance = 0): boolean {
    let threeTimes = true;
    
    for (const weekend of thisMonthWeekends) {
      if (threeTimes) {
        if (weekend.saturday) {
          const dayOfDuty = this.getDay(weekend.saturday);

          const duty = dayOfDuty.getDuty(0);

          duty.isFull();
        }

        if (weekend.sunday) {
          const dayOfDuty = this.getDay(weekend.sunday);


        }
      } else {

      }

      threeTimes = !threeTimes;
    }

    throw new Error('Method not implemented');
  }

  assignArray(workers: WorkerInfo[]): boolean {


    throw new Error('Method not implemented');
  }
}