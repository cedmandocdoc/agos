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

  run(sink) {
    const runner = new MergeRunner(this.streams);
    runner.run(sink);

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

class MergeRunner {
  constructor(streams) {
    this.streams = streams;
    this.teardowns = [];
    this.inprogress = 0;
  }

  run(sink) {
    for (let index = 0; index < this.streams.length; index++) {
      const stream = this.streams[index];
      const producer = Teardown.join(Guard.join(stream.producer));
      this.inprogress++;
      const control = producer.run(
        new MergeSink(sink, index, this),
        new State()
      );
      this.teardowns[index] = control.stop;
    }
  }
}

class MergeSink extends Sink {
  constructor(sink, index, runner) {
    super(sink);
    this.index = index;
    this.runner = runner;
  }

  next(d) {
    this.sink.next(d, this.index);
  }

  complete() {
    this.runner.inprogress--;
    this.runner.teardowns[this.index] = () => {};
    if (this.runner.inprogress <= 0) this.sink.complete();
  }

  error(e) {
    this.runner.teardowns[this.index] = () => {};
    this.sink.error(e);
  }
}

export default Merge;
