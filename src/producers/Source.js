class Source {
  constructor(fn) {
    this.fn = fn;
  }

  run(sink, state) {
    const control = this.fn(sink, state);
    return control || { stop: () => {} };
  }
}

export default Source;
