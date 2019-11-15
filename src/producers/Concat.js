import Stream from "../Stream";
import Sink from "../Sink";
import State from "../State";
import Teardown from "./Teardown";
import Guard from "./Guard";

class Concat {
  constructor(streams = []) {
    this.streams = streams;
  }

  static join(producer, streams = []) {
    return producer instanceof Concat
      ? new Concat([...producer.streams, ...streams])
      : new Concat([new Stream(producer), ...streams]);
  }

  run(sink) {
    const runner = new ConcatRunner(this.streams);
    runner.run(new ConcatSink(sink, runner));

    return {
      stop: () => {
        for (let index = 0; index < runner.teardowns.length; index++) {
          const teardown = runner.teardowns[index];
          teardown();
        }
      }
    };
  }
}

class ConcatRunner {
  constructor(streams) {
    this.streams = streams;
    this.teardowns = [];
    this.current = 0;
  }

  run(sink) {
    const stream = this.streams[this.current];
    const producer = Teardown.join(Guard.join(stream.producer));
    const control = producer.run(sink, new State());
    this.teardowns[this.current] = control.stop;
  }
}

class ConcatSink extends Sink {
  constructor(sink, runner) {
    super(sink);
    this.runner = runner;
  }

  complete() {
    this.runner.teardowns[this.runner.current] = () => {};
    this.runner.current++;
    if (this.runner.current > this.runner.streams.length - 1)
      this.sink.complete();
    else this.runner.run(this);
  }

  error(e) {
    this.runner.teardowns[this.runner.current] = () => {};
    this.sink.error(e);
  }
}

export default Concat;
