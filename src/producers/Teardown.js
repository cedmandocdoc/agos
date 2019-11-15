import Sink from "../Sink";

class Teardown {
  constructor(producer) {
    this.producer = producer;
  }

  static join(producer) {
    return producer instanceof Teardown ? producer : new Teardown(producer);
  }

  run(sink, state) {
    const runner = new TeardownRunner();
    return runner.run(sink, state, this.producer);
  }
}

class TeardownRunner {
  constructor() {
    this.stop = () => {};
  }

  run(sink, state, producer) {
    const control = producer.run(new TeardownSink(sink, this), state);
    this.stop = control.stop;
    return control;
  }
}

class TeardownSink extends Sink {
  constructor(sink, runner) {
    super(sink);
    this.runner = runner;
  }

  complete() {
    this.runner.stop();
    this.sink.complete();
  }

  error(e) {
    this.runner.stop();
    this.sink.error(e);
  }
}

export default Teardown;
