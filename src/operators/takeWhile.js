import { Operator, CancelInterceptor } from "../Stream";

class TakeWhile extends Operator {
  constructor(source, predicate) {
    super(source);
    this.predicate = predicate;
  }

  static join(stream, predicate) {
    return stream instanceof TakeWhile
      ? new TakeWhile(stream.source, value => {
        const [included, inclusive] = stream.predicate(value);
        if (!included) return [included, inclusive];
        return predicate(value);
      })
      : super.join(stream, predicate);
  }

  listen(open, next, fail, done, talkback) {
    const cancel = CancelInterceptor.join(talkback);

    this.source(
      open,
      value => {
        const [included, inclusive] = this.predicate(value);
        if (!included) {
          if (inclusive) next(value);
          return cancel.run();
        }
        next(value);
      },
      fail,
      done,
      cancel
    );
  }
}

const takeWhile = (predicate, inclusive = false) => stream =>
  TakeWhile.join(stream, value => [predicate(value), inclusive]);

export default takeWhile;
