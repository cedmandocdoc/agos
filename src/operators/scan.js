class Scan {
  constructor(inner, accumulator, seed) {
    this.inner = inner;
    this.accumulator = accumulator;
    this.seed = seed;
  }

  static join(source, accumulator, seed) {
    return new Scan(source, accumulator, seed);
  }

  run(control) {
    let seed = this.seed;
    return this.inner.run({
      open: control.open,
      next: data => {
        seed = this.accumulator(seed, data);
        control.next(seed);
      },
      error: control.error,
      close: cb =>
        control.close(done =>
          cb(() => {
            seed = this.seed;
            done();
          })
        )
    });
  }
}

const scan = (accumulator, seed) => source =>
  Scan.join(source, accumulator, seed);

export default scan;
