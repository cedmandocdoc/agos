class Sink {
  constructor(sink, state) {
    this.sink = sink;
    this.state = state;
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
