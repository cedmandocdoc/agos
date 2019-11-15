class Sink {
  constructor(sink) {
    this.sink = sink;
  }

  next(d) {
    this.sink.next(d);
  }

  complete() {
    this.sink.complete();
  }

  error(e) {
    this.sink.error(e);
  }
}

export default Sink;
