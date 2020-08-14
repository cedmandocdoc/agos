import { Operator } from "../Observable";

class Scan extends Operator {
  constructor(source, accumulator, seed) {
    super(source);
    this.accumulator = accumulator;
    this.seed = seed;
  }

  listen(open, next, fail, done, talkback) {
    let seed = this.seed;
    this.source(
      open,
      value => {
        seed = this.accumulator(seed, value);
        next(seed);
      },
      fail,
      done,
      talkback
    );
  }
}

const scan = (accumulator, seed) => source =>
  Scan.join(source, accumulator, seed);

export default scan;
