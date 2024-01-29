export type WorkerRegistryGender = 'F' | 'M';

export type WorkerRegistry = WorkerRegistryInit & {
  readonly createdAtVersion: number;
}

export type WorkerRegistryInit = {
  readonly workerId: string;
  readonly name: string;
  readonly gender: WorkerRegistryGender;
  readonly individualId: string;
  readonly isCoordinator?: boolean;
}