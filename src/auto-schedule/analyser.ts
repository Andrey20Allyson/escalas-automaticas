import chalk from "chalk";
import { Text } from '../utils/text';
import { ExtraDutyTable } from "../extra-duty-table";
import { WorkerInfo } from "../extra-duty-table/worker-info";

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

export function analyseResult(table: ExtraDutyTable, workers: WorkerInfo[], colors = true) {
  let analysisText = new Text();

  let positionsLeft = workers.length * 10;
  let success = true;

  analysisText.writeLn(chalk.underline(`[ Numero de funcionários em cada turno do dia ]`));

  for (const day of table) {
    const numOfWorkersMap: [number, number, number, number] = [0, 0, 0, 0];
    let numOfWorkersInThisDay = 0;

    for (const duty of day) {
      const size = duty.getSize();

      if (success && size > 0 && size !== 2 && size !== 3) success = false;

      numOfWorkersInThisDay += size;
      numOfWorkersMap[duty.index] += size;
    }

    positionsLeft -= positionsLeft;

    if (numOfWorkersInThisDay <= 0) continue;

    const formatedDay = chalk.white(String(day.day + 1).padStart(2, '0'));
    const formatedDutySizes = numOfWorkersMap.map(numberToColoredString).join(', ');

    analysisText.writeLn(chalk.gray(`  Dia(${formatedDay}) => [${formatedDutySizes}]`));
  }

  analysisText.writeLn(chalk.underline(`[ Turnos ]`));

  if (success) {
    analysisText.writeLn(chalk.green(`  Todos turnos foram ocupados corretamente!`));
  } else {
    analysisText.writeLn(chalk.red(`  Alguns turnos não possuem o número correto de funcionários!`));
  }

  analysisText.writeLn(chalk.underline(`[ Plantões ]`));

  if (positionsLeft > 0) {
    analysisText.writeLn(chalk.red(`  Restam ${positionsLeft} plantões para serem ocupados!`));
  } else {
    analysisText.writeLn(chalk.green(`  Todos os funcionários estão ocupando 10 plantões!`));
  }

  return analysisText.read();
}