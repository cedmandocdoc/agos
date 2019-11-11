import Sink from "../Sink";

class Teardown {
  constructor(producer) {
    this.producer = producer;
  }

  static join(producer) {
    return producer instanceof Teardown ? producer : new Teardown(producer);
  }

  run(sink, state) {
    const teardown = new TeardownSink(sink, state);

    const control = this.producer.run(teardown, state);
    teardown.stop = control.stop;

    return control;
  }
}

class TeardownSink extends Sink {
  constructor(sink, state) {
    super(sink, state);
    this.stop = () => {};
  }

  complete() {
    this.stop();
    this.sink.complete();
  }

  error(e) {
    this.stop();
    this.sink.error(e);
  }
}

export default Teardown;
