import { Gender, Graduation, WorkerInfo } from ".";
import { parseNumberOrThrow } from "../../../utils";
import { Parser } from "../base/parser";
import { DEFAULT_DAYS_OF_WORK_PARSER, DaysOfWork } from "../days-of-work";
import { WorkLimit } from "../work-limit";
import { WorkLimitParser } from "../work-limit/parser";
import { WorkTime } from "../work-time";
import { WorkTimeParser } from "../work-time/parser";
import { WorkerIdentifier } from "../worker-identifier";
import { WorkerIdentifierParser } from "../worker-identifier/parser";

export interface WorkerInfoParseData {
  name: string;
  post: string;
  grad: string;
  year: number;
  month: number;
  hourly: string;
  gender?: string;
  workerId: string;
  individualId?: string;
  workLimit?: string;
}

export interface WorkerInfoParserOptions {
  daysOfWorkParser?: Parser<WorkerInfoParseData, DaysOfWork>;
  workTimeParser?: Parser<WorkerInfoParseData, WorkTime>;
  identifierParser?: Parser<WorkerInfoParseData, WorkerIdentifier>;
  workLimitParser?: Parser<WorkerInfoParseData, WorkLimit>;
}

export class WorkerInfoParser {
  private readonly genderMap: NodeJS.Dict<Gender> = {
    'F': 'female',
    'M': 'male',
  };

  private readonly graduationMap: NodeJS.Dict<Graduation> = {
    'INSP': 'insp',
    'GCM': 'gcm',
    'SI': 'sub-insp',
  };

  readonly daysOfWorkParser: Parser<WorkerInfoParseData, DaysOfWork>;
  readonly workTimeParser: Parser<WorkerInfoParseData, WorkTime>;
  readonly identifierParser: Parser<WorkerInfoParseData, WorkerIdentifier>;
  readonly workLimitParser: Parser<WorkerInfoParseData, WorkLimit>;

  constructor(options?: WorkerInfoParserOptions) {
    this.daysOfWorkParser = options?.daysOfWorkParser ?? DEFAULT_DAYS_OF_WORK_PARSER;
    this.workTimeParser = options?.workTimeParser ?? new WorkTimeParser();
    this.identifierParser = options?.identifierParser ?? new WorkerIdentifierParser();
    this.workLimitParser = options?.workLimitParser ?? new WorkLimitParser();
  }

  parse(data: WorkerInfoParseData): WorkerInfo | null {
    if (['FÉRIAS', 'DISP. MÉDICA MÊS'].some(skipLabel => data.post.includes(skipLabel))) return null;
    if (['LICENÇA PRÊMIO', 'LIC. PRÊMIO'].some(skipLabel => data.hourly.trim().toUpperCase() === skipLabel)) return null;

    const workTime = this.workTimeParser.parse(data);
    const daysOfWork = this.daysOfWorkParser.parse(data);
    const identifier = this.identifierParser.parse(data);
    const limit = this.workLimitParser.parse(data);

    return new WorkerInfo({
      name: data.name,
      post: data.post,
      workTime,
      limit,
      daysOfWork,
      identifier,
      graduation: this.parseGradutation(data.grad),
      gender: this.parseGender(data.gender ?? 'U'),
      individualId: data.individualId !== undefined ? parseNumberOrThrow(data.individualId.replace(/\.|\-/g, '')) : 0,
    });
  }

  parseGender(gender?: string): Gender {
    if (gender === undefined) return 'N/A';

    return this.genderMap[gender] ?? 'N/A';
  }

  parseGradutation(grad: string): Graduation {
    return this.graduationMap[grad] ?? raise(new Error(`Unknow graduation named '${grad}'!`));
  }
}

function raise(error: unknown): never {
  throw error;
}

export const DEFAULT_WORKER_INFO_PARSER = new WorkerInfoParser();