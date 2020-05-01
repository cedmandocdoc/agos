class Scan {
  constructor(source, accumulator, seed) {
    this.source = source;
    this.accumulator = accumulator;
    this.seed = seed;
  }

  static join(source, accumulator, seed) {
    return new Scan(source, accumulator, seed);
  }

  listen(open, next, fail, done, talkback) {
    let seed = this.seed;
    this.source.listen(
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
