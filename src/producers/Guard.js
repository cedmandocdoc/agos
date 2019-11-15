import Sink from "../Sink";

class Guard {
  constructor(producer) {
    this.producer = producer;
  }

  static join(producer) {
    return producer instanceof Guard ? producer : new Guard(producer);
  }

  run(sink, state) {
    return this.producer.run(new GuardSink(sink, state), state);
  }
}

class GuardSink extends Sink {
  constructor(sink, state) {
    super(sink);
    this.state = state;
  }

  next(d) {
    if (!this.state.active) return;
    this.sink.next(d);
  }

  complete() {
    if (!this.state.active) return;
    this.state.disable();
    this.sink.complete();
  }

  error(e) {
    if (!this.state.active) return;
    this.state.disable();
    this.sink.error(e);
  }
}

export default Guard;
