import { program } from "commander";
import z from 'zod';
import { execute } from "./auto-schedule";

export const programOptionsSchema = z.object({
  output: z.string().optional(),
  analyse: z.boolean(),
  benchmark: z.boolean(),
  sheetName: z.string().optional(),
  hourly: z.string().optional(),
  names: z.string().optional(),
  sortByName: z.boolean(),
})

export type ProgramOptions = z.infer<typeof programOptionsSchema>;

export async function main() {
  program.option('-o, --output <path>', 'output file');
  program.option('-a, --analyse', 'analyse result', false);
  program.option('-b, --benchmark', 'benchmark the process', false);
  program.option('-n, --names <string>', 'the cells sequence that contain worker names');
  program.option('-h, --hourly <string>', 'the cells sequence that contain worker hourly');
  program.option('-s, --sheetName <string>', 'the excel sheet with data');
  program.option('--sortByName', 'sort the result by worker name', false);

  program.parse();

  const {
    sortByName,
    sheetName,
    benchmark,
    analyse,
    output,
  } = programOptionsSchema.parse(program.opts());

  const input = program.args.at(0);

  if (!input) throw new Error(`Can't initialize because this program needs a input file`);

  await execute({
    sortByName,
    sheetName,
    benchmark,
    analyse,
    output,
    input,
  });
}

main();