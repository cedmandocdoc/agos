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
      return this.inner.run({
        open: control.open,
        next: data => {
          values.push(data);
        },
        error: control.error,
        close: cb =>
          control.close(done =>
            cb(() => {
              const sliced = values.slice(this.start, this.end);
              for (let index = 0; index < sliced.length; index++) {
                control.next(sliced[index]);
              }
              values = [];
              done();
            })
          )
      });
    }
    // slice sink
    let count = 0;
    let close = noop;
    return this.inner.run({
      open: control.open,
      next: data => {
        count++;
        count > this.start && control.next(data);
        count >= this.end && close();
      },
      error: control.error,
      close: cb => {
        close = control.close(done =>
          cb(() => {
            count = 0;
            done();
          })
        );
        return close;
      }
    });
  }
}

const slice = (start, end) => source => Slice.join(source, start, end);

export default slice;
