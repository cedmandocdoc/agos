import { CancelInterceptor } from "../utils";

class TakeWhile {
  constructor(source, predicate) {
    this.source = source;
    this.predicate = predicate;
  }

  static join(source, predicate) {
    return source instanceof TakeWhile
      ? new TakeWhile(
          source.source,
          value => source.predicate(value) || predicate(value)
        )
      : new TakeWhile(source, predicate);
  }

  listen(open, next, fail, done, talkback) {
    const cancel = new CancelInterceptor(talkback);

    this.source.listen(
      open,
      value => {
        if (!this.predicate(value)) return cancel.run();
        next(value);
      },
      fail,
      done,
      cancel
    );
  }
}

const takeWhile = predicate => source => TakeWhile.join(source, predicate);

export default takeWhile;
