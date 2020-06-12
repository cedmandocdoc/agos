import { CancelInterceptor } from "../utils";

class Slice {
  constructor(source, start = 0, end = Infinity) {
    this.source = source;
    this.start = start;
    this.end = end;
  }

  static join(source, start = 0, end = Infinity) {
    return source instanceof Slice
      ? new Slice(
          source.source,
          start < 0 ? start : source.start + start,
          end < source.end ? end : source.end
        )
      : new Slice(source, start, end);
  }

  listen(open, next, fail, done, talkback) {
    if (this.start < 0 || this.end < 0) {
      // future sink
      const values = [];

      this.source.listen(
        open,
        value => values.push(value),
        fail,
        cancelled => {
          const sliced = values.slice(this.start, this.end);
          for (let index = 0; index < sliced.length; index++) {
            next(sliced[index]);
          }
          done(cancelled);
        },
        talkback
      );
    } else {
      // slice sink
      let count = 0;
      const cancel = new CancelInterceptor(talkback);

      this.source.listen(
        open,
        value => {
          count++;
          count > this.start && next(value);
          count >= this.end && cancel.run();
        },
        fail,
        done,
        cancel
      );
    }
  }
}

const slice = (start, end) => source => Slice.join(source, start, end);

export default slice;
