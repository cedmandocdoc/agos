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
      next: cb =>
        control.next((dispatch, data) =>
          cb(([data, index]) => {
            values[index] = data;
            if (!seen[index]) seen[index] = true;
            if (seen.length === this.length) dispatch(values);
          }, data)
        ),
      error: control.error,
      close: cb =>
        control.close(dispatch =>
          cb(() => {
            seen = [];
            values = [];
            dispatch();
          })
        )
    });
  }
}

const mergeLatest = sources => new MergeLatest(sources);

export default mergeLatest;
