import { Operator, CancelInterceptor } from "../Observable";

class TakeWhile extends Operator {
  constructor(source, predicate) {
    super(source);
    this.predicate = predicate;
  }

  static join(observable, predicate) {
    return observable instanceof TakeWhile
      ? new TakeWhile(observable.source, value => {
          const [included, inclusive] = observable.predicate(value);
          if (!included) return [included, inclusive];
          return predicate(value);
        })
      : super.join(observable, predicate);
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

const takeWhile = (predicate, inclusive = false) => observable =>
  TakeWhile.join(observable, value => [predicate(value), inclusive]);

export default takeWhile;
