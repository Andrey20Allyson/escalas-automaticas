import { Command, program } from "commander";
import { z } from "zod";
import { OptionInfoBuilder } from "./command-option";

export interface LoadCommandConfig<S extends z.ZodObject<z.ZodRawShape>> {
  schema: S;
  command: string | Command | undefined;
  aliases?: string[];
  description?: string;
  optionInfos?: Partial<Record<keyof z.infer<S>, OptionInfoBuilder>>;
  action?: (options: z.infer<S>, command: Command) => void;
}

export function loadCommand<S extends z.ZodObject<z.ZodRawShape>>(config: LoadCommandConfig<S>): Command {
  const command = typeof config.command === 'string' ? (
    program.command(config.command)
  ) : (
    config.command
  ) ?? (
    program
  );

  if (config.aliases !== undefined) command.aliases(config.aliases);

  for (const [name, schema] of Object.entries(config.schema.shape)) {
    const info = config.optionInfos?.[name]?.get() ?? {};

    let hint: string;
    const isOptional = schema.isOptional();
    const openHint = isOptional ? '[' : '<';
    const closeHint = isOptional ? ']' : '>';

    if (info.hint !== undefined) {
      hint = `${openHint}${info.hint}${closeHint}`;
    } else {
      hint = `${openHint}str${closeHint}`
    }

    const aliasStr = info.alias !== undefined ? `-${info.alias}, ` : '';

    command.option(`${aliasStr}--${name} ${hint}`, info.description);
  }

  if (config.description) command.description(config.description);

  const { action, schema } = config;
  if (action !== undefined) {
    command.action(() => {
      const options = schema.safeParse(command.opts()) as z.SafeParseReturnType<any, z.infer<S>>;
      if (options.success === false) {
        for (const { message, path } of options.error.errors) {
          console.error(`[--${path} Option Error]: ${message}\n`);
        }
        process.exit(1);
      }

      action(options.data, command);
    });
  }

  return command;
}