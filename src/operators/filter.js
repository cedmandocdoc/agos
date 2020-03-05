class Filter {
  constructor(inner, predicate) {
    this.inner = inner;
    this.predicate = predicate;
  }

  static join(source, predicate) {
    return source instanceof Filter
      ? new Filter(
          source.inner,
          data => source.predicate(data) && predicate(data)
        )
      : new Filter(source, predicate);
  }

  run(control) {
    return this.inner.run({
      open: control.open,
      next: data => {
        if (this.predicate(data)) control.next(data);
      },
      error: control.error,
      close: control.close
    });
  }
}

const filter = predicate => source => Filter.join(source, predicate);

export default filter;
