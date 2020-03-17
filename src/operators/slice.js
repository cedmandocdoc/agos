import { noop } from "../utils";

class Slice {
  constructor(inner, start = 0, end = Infinity) {
    this.inner = inner;
    this.start = start;
    this.end = end;
  }

  static join(source, start = 0, end = Infinity) {
    return source instanceof Slice
      ? new Slice(
          source.inner,
          start < 0 ? start : source.start + start,
          end < source.end ? end : source.end
        )
      : new Slice(source, start, end);
  }

  run(control) {
    if (this.start < 0 || this.end < 0) {
      // future sink
      let values = [];

      const next = control.next((dispatch, data) => dispatch(data));

      return this.inner.run({
        open: control.open,
        next: cb =>
          control.next((_, data) => cb(data => values.push(data), data)),
        a: data => {
          values.push(data);
        },
        error: control.error,
        close: cb =>
          control.close(dispatch =>
            cb(() => {
              const sliced = values.slice(this.start, this.end);
              for (let index = 0; index < sliced.length; index++) {
                next(sliced[index]);
              }
              values = [];
              dispatch();
            })
          )
      });
    }
    // slice sink
    let count = 0;
    let close = noop;
    return this.inner.run({
      open: control.open,
      next: cb =>
        control.next((dispatch, data) =>
          cb(data => {
            count++;
            count > this.start && dispatch(data);
            count >= this.end && close();
          }, data)
        ),
      error: control.error,
      close: cb => {
        close = control.close(dispatch =>
          cb(() => {
            count = 0;
            dispatch();
          })
        );
        return close;
      }
    });
  }
}

const slice = (start, end) => source => Slice.join(source, start, end);

export default slice;
