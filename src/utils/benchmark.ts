import chalk from 'chalk';
import { Text } from './text';

export class BenchmarkInstance {
  startTime: number;
  endTime: number;

  constructor(
    readonly name: string,
  ) {
    this.startTime = Date.now();
    this.endTime = -1;
  }

  start() {
    this.startTime = Date.now();
  }

  end() {
    this.endTime = Date.now();
  }

  dif() {
    if (this.endTime < 0) this.endTime = Date.now();

    return this.endTime - this.startTime;
  }

  toString() {
    return `${chalk.greenBright(`"${this.name}"`)} ended in ${chalk.yellow(this.dif())} miliseconds`;
  }
}

export class Benchmarker {
  private map: Map<string, BenchmarkInstance>;

  constructor() {
    this.map = new Map();
  }

  start(title: string): BenchmarkInstance {
    const instance = new BenchmarkInstance(title);

    this.map.set(instance.name, instance);

    return instance;
  }

  entries() {
    return this.map.values();
  }

  getMessage() {
    const message = new Text();

    message.writeLn(chalk.underline(`[ Benchmark ]`));

    for (const instance of this.entries()) {
      message.writeLn('  ', instance.toString());
    }

    return message.toString();
  }
}