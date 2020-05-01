class Filter {
  constructor(source, predicate) {
    this.source = source;
    this.predicate = predicate;
  }

  static join(source, predicate) {
    return source instanceof Filter
      ? new Filter(
          source.source,
          value => source.predicate(value) && predicate(value)
        )
      : new Filter(source, predicate);
  }

  listen(open, next, fail, done, talkback) {
    this.source.listen(
      open,
      value => this.predicate(value) && next(value),
      fail,
      done,
      talkback
    );
  }
}

const filter = predicate => source => Filter.join(source, predicate);

export default filter;
