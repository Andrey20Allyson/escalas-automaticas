import { WorkerRegistry } from ".";
import { adminFirestore } from "../../../firebase";
import { Loader } from "../loader";
import { WorkerRegistryParser } from "./parser";

export class FirebaseWorkerRegistryLoader implements Loader<WorkerRegistry[]> {
  readonly parser: WorkerRegistryParser;

  constructor() {
    this.parser = new WorkerRegistryParser();
  }

  async load(): Promise<WorkerRegistry[]> {
    const snapshot = await adminFirestore
      .collection('worker-registries')
      .get();

    return snapshot
      .docs
      .filter(doc => doc.id.startsWith('@') === false)
      .map(doc => this.parser.parse(doc.data()));
  }
}