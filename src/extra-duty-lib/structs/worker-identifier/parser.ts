import { InvalidIdentifierError, WorkerIdentifier } from ".";

export interface WorkerIdentifierParserData {
  name?: string;
  workerId: string;
}

export class WorkerIdentifierParser {
  parse(data: WorkerIdentifierParserData): WorkerIdentifier {
    const values = data.workerId.split('-');
    if (values.length !== 2) {
      throw this.error(data, `Expected format xxxxx-x`);
    }

    const identifier = new WorkerIdentifier(
      +values[0],
      +values[1],
    );

    if (!identifier.isValid()) {
      throw this.error(
        data,
        '\n' + identifier
          .getInvalidations()
          .map(err => `[Error]: ${err.message}`)
          .join('\n'),
      );
    }

    return identifier;
  }

  private error(data: WorkerIdentifierParserData, complement?: string) {
    return new InvalidIdentifierError(`workerId of ${JSON.stringify(data.name ?? 'Unknown')} : ${JSON.stringify(data.workerId)} don't is a valid worker id.${complement ? ` ${complement}` : ''}`);
  }
}