import chalk from 'chalk';
import { Text } from './text';

export class BenchmarkInstance {
  startTime: number;
  endTime: number;

  constructor(
    readonly name: string,
    readonly metric: BenchmarkMetric = 'millis',
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

  difInMillis(): number {
    if (this.endTime < 0) this.endTime = Date.now();

    return this.endTime - this.startTime;
  }

  difString(): string {
    const dif = this.difInMillis();

    if (this.metric === 'millis') {
      return `${dif} miliseconds`;
    }

    return `${(dif / 1000).toFixed(3)} seconds`;
  }

  toString(): string {
    return `${chalk.greenBright(`"${this.name}"`)} ended in ${chalk.yellow(this.difString())} `;
  }
}

export type BenchmarkMetric = 'millis' | 'sec';

export interface BenchmarkOptions {
  metric?: BenchmarkMetric;
}

export class Benchmarker {
  private map: Map<string, BenchmarkInstance>;
  readonly metric: BenchmarkMetric;

  constructor(options?: BenchmarkOptions) {
    this.map = new Map();

    this.metric = options?.metric ?? 'millis';
  }

  start(title: string): BenchmarkInstance {
    const instance = new BenchmarkInstance(title, this.metric);

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