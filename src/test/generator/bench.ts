import chalk from "chalk";
import { z } from "zod";
import { ExtraDutyTable, ExtraEventName } from "../../extra-duty-lib";
import { ScheduleAssignerV1 } from "../../extra-duty-lib/builders/assigners/assigner-v1";
import { AssignmentRuleStack } from "../../extra-duty-lib/builders/rule-checking";
import {
  BusyWorkerAssignmentRule,
  DutyLimitAssignmentRule,
  FemaleAssignmentRule,
  InspAssignmentRule,
  LicenseAssignmentRule,
  OrdinaryAssignmentRule,
  TimeOffAssignmentRule,
} from "../../extra-duty-lib/builders/rule-checking/rules";
import { ExtraEventAllowedTimeRule } from "../../extra-duty-lib/builders/rule-checking/rules/extra-event-allowed-time-rule";
import { ExtraEventAllowedWeekdaysRule } from "../../extra-duty-lib/builders/rule-checking/rules/extra-event-allowed-weekdays-rule";
import { ExtraEventStartDayRule } from "../../extra-duty-lib/builders/rule-checking/rules/extra-event-start-day";
import { Month } from "../../extra-duty-lib/structs/month";
import { Benchmarker, enumerate, iterRange } from "../../utils";
import { RandomWorkerMockFactory } from "./mock/worker/random";

export const benchOptionsSchema = z.object({
  times: z.number({ coerce: true }).default(1),
  weight: z
    .enum(['low', 'mid', 'high'])
    .default('low')
    .transform(weight => {
      switch (weight) {
        case "low":
          return 0;
        case "mid":
          return 1;
        case "high":
          return 2;
      }
    }),
});

export type BenchActionOptions = z.infer<typeof benchOptionsSchema>;

export function bench(options: BenchActionOptions) {
  const {
    times,
    weight,
  } = options;

  const {
    year,
    index: month,
  } = Month.now();

  const table = new ExtraDutyTable({ month, year, dutyMinDistance: 6 });
  const workers = new RandomWorkerMockFactory({ year, month })
    .array(27);

  let ruleStack = new AssignmentRuleStack([
    new DutyLimitAssignmentRule(),
    new BusyWorkerAssignmentRule(),
    new InspAssignmentRule(),
    new FemaleAssignmentRule(),
  ]);

  if (weight >= 1) {
    ruleStack = ruleStack.use(
      new ExtraEventStartDayRule(),
      new ExtraEventAllowedTimeRule(),
      new ExtraEventAllowedWeekdaysRule(),
      new LicenseAssignmentRule(),
      new OrdinaryAssignmentRule(),
      new TimeOffAssignmentRule(),
    );
  }

  const assigner = new ScheduleAssignerV1(ruleStack);

  const benchmarker = new Benchmarker();

  const events = [ExtraEventName.JIQUIA];

  if (weight >= 2) {
    events.unshift(ExtraEventName.SUPPORT_TO_CITY_HALL, ExtraEventName.JARDIM_BOTANICO_DAYTIME);
  }

  const totalOfAssigns = times * events.length;
  const progress = new ProgressBar(totalOfAssigns, .05);

  progress.start();
  const multipleAssigments = benchmarker.start('Multiple assigments');

  for (const [i, event] of enumerate(events)) {
    table.config.currentPlace = event;

    for (let j of iterRange(0, times)) {
      table.clear(event);

      assigner.assignInto(table, workers);

      progress.update(times * i + j + 1);
    }
  }

  multipleAssigments.end();

  const valuesPerSecStr = progress
    .getValuesPer('sec')
    // .filter(ValuesPerTimeEntry.higherOrLower)
    .join('\n  ');

  console.log(`Values per sec [\n  ${valuesPerSecStr}\n]`);

  console.log(`Runned ${(totalOfAssigns / multipleAssigments.difInMillis() * 1000).toFixed(0)} aps`)
}

export type ValuePerTimeScala = 'min' | 'sec' | 'milli';
export type ValuesPerTimeAvg = 'higher' | 'lower' | 'mid';
export type NumberMapper = (value: number) => number;

export class ValuesPerTimeEntry {
  constructor(
    readonly valuesPerTime: number,
    readonly difToPrev: number,
    readonly scala: ValuePerTimeScala,
    readonly avg: ValuesPerTimeAvg = 'mid',
  ) { }

  private _avgColor(): chalk.Chalk {
    switch (this.avg) {
      case "higher":
        return chalk.greenBright;
      case "lower":
        return chalk.redBright;
      case "mid":
        return chalk.white;
    }
  }

  private _difToPrevColor(): chalk.Chalk {
    const dif = this.difToPrev;

    if (dif < 0) {
      return chalk.redBright;
    }

    if (dif > 0) {
      return chalk.greenBright;
    }

    return chalk.yellow;
  }

  toString(): string {
    const difColor = this._difToPrevColor();
    const avgColor = this._avgColor();

    return `[Values per ${this.scala}: ${avgColor(this.valuesPerTime.toFixed(2))}; dif to prev: ${difColor(this.difToPrev.toFixed(2))}]`;
  }

  setAvg(avg: ValuesPerTimeAvg): ValuesPerTimeEntry {
    return new ValuesPerTimeEntry(this.valuesPerTime, this.difToPrev, this.scala, avg);
  }

  static higherOrLower(entry: ValuesPerTimeEntry): boolean {
    return entry.avg === 'higher' || entry.avg === 'lower';
  }
}

class ProgressBar {
  readonly percOfTotal: number;
  private lastTime: number;
  private difs: number[] = [];

  constructor(readonly total: number, step: number = .05) {
    step = Math.max(step, 1 / this.total, .01);

    this.percOfTotal = Math.round(this.total * step);
    this.lastTime = Date.now();
  }

  start() {
    this.lastTime = Date.now();
  }

  captureDiff(): number {
    const now = Date.now();
    const dif = now - this.lastTime;
    this.lastTime = now;

    this.difs.push(dif);

    return dif;
  }

  getDifs(): number[] {
    return [...this.difs];
  }

  getValuesPer(scala: ValuePerTimeScala, mapper?: NumberMapper): ValuesPerTimeEntry[] {
    let prevVPT: number | undefined;
    let higger: ValuesPerTimeEntry | undefined;
    let lower: ValuesPerTimeEntry | undefined;

    return this
      .getDifs()
      .map(dif => {
        let mult = 1;
        switch (scala) {
          case "min":
            mult = 1000 * 60;
          case "sec":
            mult = 1000;
        }

        const valuesPerTime = this.percOfTotal / dif * mult;

        const mappedVPT = mapper !== undefined ? mapper(valuesPerTime) : valuesPerTime;
        const entry = new ValuesPerTimeEntry(mappedVPT, valuesPerTime - (prevVPT ?? 0), scala);

        prevVPT = valuesPerTime;

        if (higger === undefined) {
          higger = entry;
        }

        if (entry.valuesPerTime > higger.valuesPerTime) {
          higger = entry;
        }

        if (lower === undefined) {
          lower = entry;
        }

        if (entry.valuesPerTime < lower.valuesPerTime) {
          lower = entry;
        }

        return entry;
      }).map(entry => {
        if (entry === higger) {
          return entry.setAvg('higher');
        }

        if (entry === lower) {
          return entry.setAvg('lower');
        }

        return entry;
      });
  }

  update(value: number) {
    const { stdout } = process;

    if (value >= this.total) {
      this.captureDiff();

      stdout.cursorTo(0);
      stdout.clearLine(0);
      stdout.write(`[ ${chalk.greenBright('Completed')} ]\n`);
      return;
    }

    if (value % this.percOfTotal !== 0) {
      return;
    }

    this.captureDiff();

    const perc = Math.max(Math.min(value / this.total, 1), 0);
    const count = Math.round(10 * perc);

    stdout.cursorTo(0);
    stdout.clearLine(0);
    stdout.write(`[ ${chalk.greenBright('#'.repeat(count))}${chalk.grey('#'.repeat(10 - count))} ${(perc * 100).toFixed(0)}% ]`);
  }
}