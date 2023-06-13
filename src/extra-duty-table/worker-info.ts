import { DaysOfWork, WorkTime } from "./parsers"; 

export interface WorkerInfoConfig {
  name: string;
  post: string;
  patent: string;
  workTime: WorkTime;
  registration: number;
  daysOfWork: DaysOfWork;
  postResistration: number;
  startPositionsLeft?: number;
}

export interface WorkerParseData {
  name: string;
  post: string;
  patent: string;
  hourly: string;
  registration: string;
}

export interface Worker {
  name: string;
  daysOfWork: DaysOfWork;
  workTime: WorkTime;
}

export class WorkerInfo implements Worker {
  positionsLeft: number;
  readonly config: WorkerInfoConfig;
  readonly startPositionsLeft: number;

  constructor(config: WorkerInfoConfig) {
    this.config = config;

    this.startPositionsLeft = config.startPositionsLeft ?? 10;
    this.positionsLeft = this.startPositionsLeft;
  }

  get name() {
    return this.config.name;
  }

  get daysOfWork() {
    return this.config.daysOfWork;
  }

  get workTime() {
    return this.config.workTime;
  }

  resetPositionsLeft() {
    this.positionsLeft = this.startPositionsLeft;
  }

  occupyPositions(num = 1) {
    this.positionsLeft -= num;
  }

  leavePositions(num = 1) {
    this.positionsLeft += num;
  }

  isPositionsLeftEqualsToStart() {
    return this.positionsLeft === this.startPositionsLeft;
  }

  isCompletelyBusy(positions = 1) {
    return this.positionsLeft - positions < 0;
  }

  static parse(data: WorkerParseData) {
    if (data.hourly.includes('FÉRIAS')) return;

    const workTime = WorkTime.parse(data.hourly);
    if (!workTime) throw new Error(`Can't parse workTime of "${data.name}"`);

    const daysOfWork = DaysOfWork.parse(data.hourly);
    if (!daysOfWork) throw new Error(`Can't parse daysOfWork of "${data.name}"!`);

    const splitedRegistration = data.registration.split('-');
    if (splitedRegistration.length !== 2) throw new Error(`Can't parse registration "${data.registration}"`);

    const [registration, postResistration] = splitedRegistration.map(parseNumberOrThrow);
    
    return new this({
      name: data.name,
      postResistration,
      registration,
      patent: data.patent,
      post: data.post,
      workTime,
      daysOfWork,
    });
  }

  static fakeFromName(name: string) {
    return new WorkerInfo({
      name,
      post: 'N/A',
      patent: 'N/A',
      registration: 0,
      postResistration: 0,
      workTime: new WorkTime(7, 8),
      daysOfWork: DaysOfWork.fromDays([]),
    });
  }
}

function parseNumberOrThrow(value?: unknown) {
  const num = Number(value);
  if (isNaN(num)) throw new Error(`Can't parse "${value}" because results in NaN!`);
  return num;
}