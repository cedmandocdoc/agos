import merge from "./merge";

class MergeLatest {
  constructor(sources) {
    this.source = merge(sources);
    this.length = sources.length;
  }

  run(control) {
    let seen = [];
    let values = [];
    return this.source.run({
      open: control.open,
      next: (data, index) => {
        values[index] = data;
        if (!seen[index]) seen[index] = true;
        if (seen.length === this.length) control.next(values);
      },
      error: control.error,
      close: cb =>
        control.close(done =>
          cb(() => {
            seen = [];
            values = [];
            done();
          })
        )
    });
  }
}

const mergeLatest = sources => new MergeLatest(sources);

export default mergeLatest;
