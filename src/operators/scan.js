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
      next: cb =>
        control.next((dispatch, data) =>
          cb(data => {
            seed = this.accumulator(seed, data);
            dispatch(seed);
          }, data)
        ),
      error: control.error,
      close: cb =>
        control.close(dispatch =>
          cb(() => {
            seed = this.seed;
            dispatch();
          })
        )
    });
  }
}

const scan = (accumulator, seed) => source =>
  Scan.join(source, accumulator, seed);

export default scan;
