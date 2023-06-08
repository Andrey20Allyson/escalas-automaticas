import { execute } from './auto-schedule';

const INPUT_FILE = './input/data.xlsx';
const OUTPUT_FILE = './output/out-data.xlsx';

execute({
  input: INPUT_FILE,
  output: OUTPUT_FILE,
  analyse: true,
  benchmark: true,
});