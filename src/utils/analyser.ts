import chalk from "chalk";
import { Text } from './text';
import { ExtraDutyTable, WorkerInfo } from "../extra-duty-lib";

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
    const numOfWorkersMap: [number, number, number, number] = [0, 0, 0, 0];
    let numOfWorkersInThisDay = 0;

    for (const duty of day) {
      const size = duty.getSize();

      for (const [_, worker] of duty) {
        if (table.limiter.positionsLeftOf(worker) > 0) workersWithPositionsLeft.add(worker);
      }

      numOfWorkersInThisDay += size;
      numOfWorkersMap[duty.index] = size;
    }

    const formatedDay = chalk.white(String(day.index + 1).padStart(2, '0'));
    const formatedDutySizes = numOfWorkersMap.map(numberToColoredString).join(', ');

    analysisText.writeLn(chalk.gray(`  Dia(${formatedDay}) => [${formatedDutySizes}]`));
  }

  analysisText.writeLn(chalk.underline(`[ Plantões ]`));

  if (workersWithPositionsLeft.size > 0) {
    const totalOfPositionsLeft = Array.from(workersWithPositionsLeft).reduce((prev, worker) => prev + table.limiter.positionsLeftOf(worker), 0);

    analysisText.writeLn(chalk.red(`  Restam ${totalOfPositionsLeft} plantões para serem ocupados!`));
  } else {
    analysisText.writeLn(chalk.green(`  Todos os funcionários estão ocupando 10 plantões!`));
  }

  return analysisText.read();
}