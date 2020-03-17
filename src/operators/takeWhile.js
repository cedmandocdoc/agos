import { noop } from "../utils";

class TakeWhile {
  constructor(inner, predicate) {
    this.inner = inner;
    this.predicate = predicate;
  }

  static join(source, predicate) {
    return source instanceof TakeWhile
      ? new TakeWhile(
          source.inner,
          data => source.predicate(data) || predicate(data)
        )
      : new TakeWhile(source, predicate);
  }

  run(control) {
    let close = noop;
    return this.inner.run({
      open: control.open,
      next: cb =>
        control.next((dispatch, data) =>
          cb(data => {
            if (!this.predicate(data)) close();
            else dispatch(data);
          }, data)
        ),
      error: control.error,
      close: cb => {
        close = control.close(cb);
        return close;
      }
    });
  }
}

const takeWhile = predicate => source => TakeWhile.join(source, predicate);

export default takeWhile;
