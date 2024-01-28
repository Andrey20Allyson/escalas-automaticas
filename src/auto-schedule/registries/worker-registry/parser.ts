import { z } from "zod";
import { WorkerRegistry } from ".";

export class WorkerRegistryParser {
  readonly schema = z.object({
    name: z.string(),
    workerID: z.string().transform(id => id.replace(/\./g, '')),
    individualID: z.string(),
    gender: z.enum(['M', 'F']),
  });

  parse(value: unknown): WorkerRegistry {
    const {
      gender,
      individualID,
      name,
      workerID,
    } = this.schema.parse(value);

    return new WorkerRegistry(
      workerID,
      name,
      gender,
      individualID,
    );
  }
}