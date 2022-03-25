export class Intervals {
  standardIntervals: StandardInterval[];
  residualInterval: Nullable<ResidualInterval>;

  constructor() {
    this.standardIntervals = [];
    this.residualInterval = null;
  }
}

export class StandardInterval {
  intervalStartDate: Date;
  intervalEndDate: Date;
}

export class ResidualInterval {
  intervalStartDate: Date;
  intervalEndDate: Date;
  duration: number;
}
