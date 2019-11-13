import Stream from "../Stream";
import Sink from "../Sink";
import State from "../State";
import Teardown from "./Teardown";
import Guard from "./Guard";

class Concat {
  constructor(streams) {
    this.streams = streams;
  }

  static join(producer, streams) {
    return producer instanceof Concat
      ? new Concat([...producer.streams, ...streams])
      : new Concat([new Stream(producer), ...streams]);
  }

  run(sink, state) {
    const concat = new ConcatSink(sink, state, this.streams);
    concat.run();
    return {
      stop: () => {
        for (let index = 0; index < concat.teardowns.length; index++) {
          const teardown = concat.teardowns[index];
          teardown();
        }
      }
    };
  }
}

class ConcatSink extends Sink {
  constructor(sink, state, streams) {
    super(sink, state);
    this.steams = streams;
    this.teardowns = [];
    this.current = 0;
  }

  complete() {
    this.teardowns[this.current] = () => {};
    this.current++;
    if (this.current > this.steams.length - 1) this.sink.complete();
    else this.run();
  }

  error(e) {
    this.teardowns[this.current] = () => {};
    this.sink.error(e);
  }

  run() {
    const stream = this.steams[this.current];
    if (!stream) return;
    const producer = Teardown.join(Guard.join(stream.producer));
    const control = producer.run(this, new State());
    this.teardowns[this.current] = control.stop;
  }
}

export default Concat;
