import { z } from "zod";

export const AUTO_SCHEDULE_CONFIG_SCHEMA = z.object({
  firebase: z.object({
    key: z
      .string()
      .default('input/firebase-key.json'),
  }).default({}),

  registries: z.object({
    cacheDir: z
      .string()
      .default('.cache/auto-schedule/'),
  }).default({}),
});