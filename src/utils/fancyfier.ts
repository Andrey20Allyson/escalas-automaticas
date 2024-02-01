import chalk from "chalk";
import { ExtraDutyTable, ExtraPlace, WorkerInfo } from "../extra-duty-lib";
import { TableIntegrity } from "../extra-duty-lib/builders/integrity";
import { Text } from "./text";
import { Benchmarker } from "./benchmark";

export class FreeWorkerMessageData {
  constructor(
    readonly table: ExtraDutyTable,
    readonly workers: WorkerInfo[],
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

  private _stringifyFreeWorkerMessage(data: FreeWorkerMessageData) {
    const { table, workers } = data;
    const message = new Text();

    message.writeLn(`[ Free Workers ]`);

    for (const place of [ExtraPlace.JARDIM_BOTANICO, ExtraPlace.JIQUIA]) {
      table.config.currentPlace = place;

      const freeWorkerDescriptions = workers
        .filter(wr => wr.limit.of(place) > 0 && table.limiter.positionsLeftOf(wr) > 0)
        .map(wr => `'${chalk.green(wr.name)}' - ${table.limiter.positionsLeftOf(wr)}/${wr.limit.of(place)}`);

      if (freeWorkerDescriptions.length === 0) continue;

      message
        .tab()
        .writeLn(`[ Place: '${table.config.currentPlace}' ]`);

      freeWorkerDescriptions.forEach(desc => message.tab(2).writeLn(desc));
    }

    return message.toString();
  }

  stringfy(value: unknown): string {
    if (value instanceof TableIntegrity) {
      return this._stringfyIntegrity(value);
    }

    if (value instanceof FreeWorkerMessageData) {
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