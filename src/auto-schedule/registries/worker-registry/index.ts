export type WorkerRegistryGender = 'F' | 'M';

export type WorkerRegistry = {
  workerId: string;
  name: string;
  gender: WorkerRegistryGender;
  individualId: string;
  isCoordinator?: boolean;
}