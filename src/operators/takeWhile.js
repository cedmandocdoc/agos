import { CancelInterceptor } from "../utils";

class TakeWhile {
  constructor(source, predicate) {
    this.source = source;
    this.predicate = predicate;
  }

  static join(source, predicate) {
    return source instanceof TakeWhile
      ? new TakeWhile(source.source, value => {
          const [included, inclusive] = source.predicate(value);
          if (!included) return [included, inclusive];
          return predicate(value);
        })
      : new TakeWhile(source, predicate);
  }

  listen(open, next, fail, done, talkback) {
    const cancel = new CancelInterceptor(talkback);

    this.source.listen(
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

const takeWhile = (predicate, inclusive = false) => source =>
  TakeWhile.join(source, value => [predicate(value), inclusive]);

export default takeWhile;
