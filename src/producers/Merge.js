import Stream from "../Stream";
import Sink from "../Sink";
import State from "../State";
import Teardown from "./Teardown";
import Guard from "./Guard";

class Merge {
  constructor(streams) {
    this.streams = streams;
  }

  static join(producer, streams) {
    return producer instanceof Merge
      ? new Merge([...producer.streams, ...streams])
      : new Merge([new Stream(producer), ...streams]);
  }

  run(sink, state) {
    const main = new MainSink(sink, state);
    main.inprogress = this.streams.length;

    for (let index = 0; index < this.streams.length; index++) {
      const current = new CurrentSink(sink, state, index, main);
      const stream = this.streams[index];
      const producer = Teardown.join(Guard.join(stream.producer));
      const control = producer.run(current, new State());
      main.teardowns[index] = control.stop;
    }

    return {
      stop: () => {
        for (let index = 0; index < main.teardowns.length; index++) {
          const teardown = main.teardowns[index];
          teardown();
        }
      }
    };
  }
}

class MainSink extends Sink {
  constructor(sink, state) {
    super(sink, state);
    this.inprogress = 0;
    this.teardowns = [];
  }

  complete() {
    this.inprogress--;
    if (this.inprogress === 0) this.sink.complete();
  }
}

class CurrentSink extends Sink {
  constructor(sink, state, index, main) {
    super(sink, state);
    this.index = index;
    this.main = main;
  }

  next(d) {
    this.sink.next(d, this.index);
  }

  complete() {
    this.main.teardowns[this.index] = () => {};
    this.main.complete();
  }

  error(e) {
    this.main.teardowns[this.index] = () => {};
    this.main.error(e);
  }
}

export default Merge;
