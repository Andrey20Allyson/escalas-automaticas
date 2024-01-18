export interface WorkLimitEntry {
  place: string,
  limit: number,
}

export class WorkLimit {
  private places: Map<string, number>;
  
  constructor(
    limits: WorkLimitEntry[] = [],
    private defaultLimit: number = 10,
  ) {
    this.places = new Map(limits.map(entry => [entry.place, entry.limit] as const));
  }

  *iter(): Iterable<WorkLimitEntry> {
    for (const [place, limit] of this.places) {
      yield { place, limit };
    }
  }

  of(place: string): number {
    return this.places.get(place) ?? this.defaultLimit;
  }
}