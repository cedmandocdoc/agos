import { Operator } from "../Stream";

class Filter extends Operator {
  constructor(source, predicate) {
    super(source);
    this.predicate = predicate;
  }

  static join(stream, predicate) {
    return stream instanceof Filter
      ? new Filter(
        stream.source,
        value => stream.predicate(value) && predicate(value)
      )
      : super.join(stream, predicate);
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

const filter = predicate => stream => Filter.join(stream, predicate);

export default filter;
