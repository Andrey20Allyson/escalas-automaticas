import { program } from 'commander';
import { z } from 'zod';
import { DEFAULT_MONTH_PARSER } from '../../extra-duty-lib/structs/month';
import { OptionInfoBuilder, loadCommand } from './cli';
import { generate } from './action';
import { bench, benchOptionsSchema } from './bench';

const generateOptionsSchema = z.object({
  mode: z
    .enum(['input-file', 'mock'])
    .optional(),
  input: z
    .string()
    .optional(),
  output: z
    .string()
    .optional(),
  tries: z
    .number({ coerce: true })
    .optional(),
  date: z
    .string({ required_error: `Can't run with out the date, pass -d or --date config` })
    .transform(s => DEFAULT_MONTH_PARSER.parse(s))
});

export type GenerateCommandOptions = z.infer<typeof generateOptionsSchema>;

loadCommand({
  schema: generateOptionsSchema,
  command: 'generate',
  aliases: ['gen', 'g'],
  description: `Generates a extra schedule`,
  optionInfos: {
    date: OptionInfoBuilder
      .alias('d')
      .describe('the month of extra duty table'),
    input: OptionInfoBuilder
      .alias('i')
      .describe('the input file path'),
    output: OptionInfoBuilder
      .alias('o')
      .describe('the output file path'),
    tries: OptionInfoBuilder
      .alias('t')
      .describe('the number of times that the program will try generate the table'),
    mode: OptionInfoBuilder
      .alias('m')
      .describe('select the execution mode'),
  },
  action: generate,
});

loadCommand({
  schema: benchOptionsSchema,
  command: 'bench',
  aliases: ['bnc', 'b', 'mark'],
  description: `Benchmarks the table generation`,
  optionInfos: {
    times: OptionInfoBuilder
      .alias('t')
      .describe('How much times the program with run the assign procedure'),
    weight: OptionInfoBuilder
      .alias('w')
      .describe('How much hard is to assign a worker')
      .hint('low|mid|high'),
  },
  action: bench,
});

program.parse();