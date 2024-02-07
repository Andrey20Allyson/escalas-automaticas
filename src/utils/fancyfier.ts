import chalk from "chalk";
import { ExtraDutyTable, WorkerInfo } from "../extra-duty-lib";
import { TableIntegrity } from "../extra-duty-lib/builders/integrity";
import { Text } from "./text";
import { Benchmarker } from "./benchmark";

export class UnassignedWorkersMessageData {
  constructor(
    readonly table: ExtraDutyTable,
    readonly workers: WorkerInfo[],
    readonly places: string[],
  ) { }
}

export class Fancyfier {
  private _stringfyIntegrity(integrity: TableIntegrity): string {
    const message = new Text();

    message.writeLn(`[ Table Integrity ]`);

    if (integrity.failures.size > 0) message
      .tab()
      .writeLn(`[ ${chalk.red('Failures')} ]`);

    for (const [_, failure] of integrity.failures) {
      message
        .tab(2)
        .write(chalk.red(failure.name));

      if (failure.accumulate > 0) message.write(` \u00d7 ${failure.accumulate}`);

      message.writeLn();
    }

    if (integrity.warnings.size > 0) message
      .tab()
      .writeLn(`[ ${chalk.yellow('Warnings')} ]`);

    for (const [_, warning] of integrity.warnings) {
      message
        .tab(2)
        .write(`'${chalk.yellow(warning.name)}'`);

      if (warning.accumulate > 0) message.write(` \u00d7 ${warning.accumulate}`);

      message.writeLn(` - Penality +${warning.getPenalityAcc().toString()}`);
    }

    message
      .tab()
      .writeLn(`[ Total Penality ]`)
      .tab(2)
      .writeLn(`got ${integrity.getWarningPenality()} of limit ${integrity.maxAcceptablePenalityAcc}`)

    return message.toString();
  }

  private _stringifyFreeWorkerMessage(data: UnassignedWorkersMessageData) {
    const { table, workers, places } = data;
    const message = new Text();

    message.writeLn(`[ Unassigned Workers ]`);

    let everybodyIsAssigned = true;

    for (const place of places) {
      table.config.currentPlace = place;

      const unassignedWorkerDescriptions = workers
        .filter(wr => wr.limit.of(place) > 0 && table.limiter.positionsLeftOf(wr) > 0)
        .map(wr => `'${chalk.yellow(wr.name)}' - ${table.limiter.positionsLeftOf(wr)}/${wr.limit.of(place)}`);

      if (unassignedWorkerDescriptions.length === 0) continue;

      everybodyIsAssigned = false;

      message
        .tab()
        .writeLn(`[ Place: '${chalk.green(table.config.currentPlace)}' ]`);

      unassignedWorkerDescriptions.forEach(desc => message.tab(2).writeLn(desc));
    }

    if (everybodyIsAssigned) {
      message
        .tab()
        .writeLn(chalk.greenBright(`All Workers Has Assigned!`))
    }

    return message.toString();
  }

  stringfy(value: unknown): string {
    if (value instanceof TableIntegrity) {
      return this._stringfyIntegrity(value);
    }

    if (value instanceof UnassignedWorkersMessageData) {
      return this._stringifyFreeWorkerMessage(value);
    }

    if (value instanceof Benchmarker) {
      return value.getMessage();
    }

    throw new Error(`Can't find a stringifier for ${value}`);
  }

  log(value: unknown): void {
    const message = this.stringfy(value);

    console.log(message);
  }
}