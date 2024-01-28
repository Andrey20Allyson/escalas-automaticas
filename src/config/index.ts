import fs from "fs";
import path from "path";
import { z } from "zod";

const CONFIG_PATH = path.resolve(
  process.cwd(),
  `auto-schedule.config.json`,
);

const configSchema = z.object({
  firebase: z.object({
    key: z
      .string()
      .default('input/firebase-key.json'),
  }).default({}),
});

export type AutoScheduleConfig = z.infer<typeof configSchema>;

let configFileExists: boolean;

try {
  fs.accessSync(CONFIG_PATH);
  configFileExists = true;
} catch {
  configFileExists = false;
}

const configBuffer = configFileExists ? fs.readFileSync(CONFIG_PATH, { encoding: 'utf-8' }) : '{}';
export const config = configSchema.parse(JSON.parse(configBuffer));

type RecursivePartial<T> = { [K in keyof T]?: T[K] extends object ? RecursivePartial<T[K]> : T[K] };

function recursiveAssign<T>(partialValue: RecursivePartial<T> | undefined | null, defaultValue: T): T {
  if (partialValue === undefined || partialValue === null) return defaultValue;
  if (typeof defaultValue !== 'object') {
    return (partialValue ?? defaultValue) as T;
  }

  const object = {} as T;

  for (const key in defaultValue) {
    object[key] = recursiveAssign<T[Extract<keyof T, string>]>(partialValue[key], defaultValue[key]);
  }

  return object;
}

export function createAutoScheduleConfig(factory: (config: AutoScheduleConfig) => RecursivePartial<AutoScheduleConfig>): AutoScheduleConfig {
  const defaultConfig = configSchema.parse({});

  const partialConfig = factory(defaultConfig);

  return recursiveAssign(partialConfig, defaultConfig);
}

console.log(config);