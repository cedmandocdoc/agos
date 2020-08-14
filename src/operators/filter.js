import { Operator } from "../Observable";

class Filter extends Operator {
  constructor(source, predicate) {
    super(source);
    this.predicate = predicate;
  }

  static join(observable, predicate) {
    return observable instanceof Filter
      ? new Filter(
          observable.source,
          value => observable.predicate(value) && predicate(value)
        )
      : super.join(observable, predicate);
  }

  listen(open, next, fail, done, talkback) {
    this.source(
      open,
      value => this.predicate(value) && next(value),
      fail,
      done,
      talkback
    );
  }
}

const filter = predicate => observable => Filter.join(observable, predicate);

export default filter;
