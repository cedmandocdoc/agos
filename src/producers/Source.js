class Source {
  constructor(fn) {
    this.fn = fn;
  }

  run(sink) {
    const control = this.fn(sink);
    return control || { stop: () => {} };
  }
}

export default Source;
