import { Operator, CancelInterceptor } from "../Observable";

class Slice extends Operator {
  constructor(source, start = 0, end = Infinity) {
    super(source);
    this.start = start;
    this.end = end;
  }

  static join(observable, start = 0, end = Infinity) {
    return observable instanceof Slice
      ? new Slice(
          observable.source,
          start < 0 ? start : observable.start + start,
          end < observable.end ? end : observable.end
        )
      : super.join(observable, start, end);
  }

  listen(open, next, fail, done, talkback) {
    if (this.start < 0 || this.end < 0) {
      // future sink
      const values = [];

      this.source(
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
      const cancel = CancelInterceptor.join(talkback);

      this.source(
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
