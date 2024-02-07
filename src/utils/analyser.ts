import chalk from "chalk";
import { Text } from './text';
import { ExtraDutyTable, ExtraPlace, WorkerInfo } from "../extra-duty-lib";
import { enumerate } from "./iteration";

export function numberToColoredString(value: number) {
  switch (value) {
    case 0:
      return chalk.cyanBright(value);
    case 2:
      return chalk.greenBright(value);
    case 3:
      return chalk.yellow(value);
  }

  return chalk.red(value);
}

export function analyseResult(table: ExtraDutyTable, colors = true) {
  let analysisText = new Text();

  analysisText.writeLn(chalk.underline(`[ Numero de funcionários em cada turno do dia ]`));

  const workersWithPositionsLeft = new Set<WorkerInfo>();

  for (const day of table) {
    let numOfWorkersInThisDay = 0;

    const formatedDutySizesList: string[] = [];

    for (const place of [ExtraPlace.JIQUIA, ExtraPlace.JARDIM_BOTANICO]) {
      let dutySizeCounters: number[] = [0, 0, 0, 0];
      table.config.currentPlace = place;

      for (const [i, duty] of enumerate(day.pair().all())) {
        const size = duty.getSize();
  
        for (const [_, worker] of duty) {
          if (table.limiter.positionsLeftOf(worker) > 0) workersWithPositionsLeft.add(worker);
        }
  
        numOfWorkersInThisDay += size;
        dutySizeCounters[i] = size;
      }

      formatedDutySizesList.push(dutySizeCounters.map(numberToColoredString).join(', '));
    }

    const formatedDay = chalk.white(String(day.index + 1).padStart(2, '0'));

    analysisText.writeLn(chalk.gray(`  Dia(${formatedDay}) => [${formatedDutySizesList.join('] | [')}]`));
  }

  return analysisText.read();
}