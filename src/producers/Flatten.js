import State from "../State";
import Sink from "../Sink";
import Teardown from "./Teardown";
import Guard from "./Guard";

class Flatten {
  constructor(producer, level = 1) {
    this.producer = producer;
    this.level = level;
  }

  static join(producer, level = 1) {
    return producer instanceof Flatten
      ? new Flatten(producer.producer, producer.level + level)
      : new Flatten(producer, level);
  }

  run(sink, state) {
    const runner = new FlattenRunner(this.level);
    const control = runner.run(sink, state, Teardown.join(this.producer), 0);

    return {
      ...control,
      stop: () => {
        for (let index = 0; index < runner.teardowns; index++) {
          const teardown = runner.teardowns[index];
          teardown();
        }
      }
    };
  }
}

class FlattenRunner {
  constructor(level) {
    this.level = level;
    this.teardowns = [];
    this.inprogress = 0;
    this.count = 0;
  }

  run(sink, state, producer, level) {
    this.inprogress++;
    const flatSink = new FlattenSink(sink, this.count, level, this);
    this.count++;
    const control = producer.run(flatSink, state);
    this.teardowns[flatSink.index] = control.stop;
    return control;
  }
}

class FlattenSink extends Sink {
  constructor(sink, index, level, runner) {
    super(sink);
    this.index = index;
    this.level = level;
    this.runner = runner;
  }

  next(d) {
    if (this.runner.level <= this.level) this.sink.next(d);
    else {
      const producer = Teardown.join(Guard.join(d.producer));
      this.runner.run(this.sink, new State(), producer, this.level + 1);
    }
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

export default Flatten;
