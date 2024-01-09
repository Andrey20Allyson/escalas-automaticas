import { WorkerInfo } from ".";
import { parseNumberOrThrow } from "../../../utils";
import { DEFAULT_DAYS_OF_WORK_PARSER, DaysOfWorkParser } from "../days-of-work";
import { IWorkTimeParser, WorkTimeParser } from "../work-time/parser";

export interface WorkerInfoParseData {
  name: string;
  post: string;
  grad: string;
  year: number;
  month: number;
  hourly: string;
  gender?: string;
  registration: string;
  individualRegistry?: string;
}

export class WorkerInfoParser {
  readonly daysOfWorkParser: DaysOfWorkParser;
  readonly workTimeParser: IWorkTimeParser;

  constructor() {
    this.daysOfWorkParser = DEFAULT_DAYS_OF_WORK_PARSER;
    this.workTimeParser = new WorkTimeParser();
  }

  parse(data: WorkerInfoParseData): WorkerInfo | null {
    if (['FÉRIAS', 'LIC. PRÊMIO', 'DISP. MÉDICA MÊS'].some(skipLabel => data.post.includes(skipLabel))) return null;

    const workTime = this.workTimeParser.parse(data);
    const daysOfWork = this.daysOfWorkParser.parse(data);
    
    const splitedRegistration = data.registration.split('-');
    if (splitedRegistration.length !== 2) throw new Error(`Can't parse registration "${data.registration}"`);

    const [registration, postResistration] = splitedRegistration.map(parseNumberOrThrow);

    return new WorkerInfo({
      name: data.name,
      postWorkerID: postResistration,
      workerID: registration,
      grad: data.grad,
      post: data.post,
      workTime,
      daysOfWork,
      gender: data.gender ?? 'U',
      individualRegistry: data.individualRegistry !== undefined ? parseNumberOrThrow(data.individualRegistry.replace(/\.|\-/g, '')) : 0,
    });
  }
}

export const DEFAULT_WORKER_INFO_PARSER = new WorkerInfoParser();