import Stream from "../Stream";
import State from "../State";
import Sink from "../Sink";
import Teardown from "./Teardown";
import Guard from "./Guard";

class Flatten {
  constructor(producer) {
    this.producer = producer;
  }

  static join(producer) {
    return producer instanceof Flatten ? producer : new Flatten(producer);
  }

  run(sink, state) {
    const runner = new FlattenRunner();
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
  constructor() {
    this.teardowns = [];
    this.inprogress = 0;
  }

  run(sink, state, producer, index) {
    this.inprogress++;
    const control = producer.run(new FlattenSink(sink, index, this), state);
    this.teardowns[index] = control.stop;
    return control;
  }
}

class FlattenSink extends Sink {
  constructor(sink, index, runner) {
    super(sink);
    this.index = index;
    this.runnner = runner;
  }

  next(d) {
    if (d instanceof Stream) {
      const producer = Teardown.join(Guard.join(d.producer));
      this.runnner.run(this.sink, new State(), producer, this.index + 1);
    } else {
      this.sink.next(d);
    }
  }

  complete() {
    this.runnner.inprogress--;
    this.runnner.teardowns[this.index] = () => {};
    if (this.runnner.inprogress <= 0) this.sink.complete();
  }

  error(e) {
    this.runnner.teardowns[this.index] = () => {};
    this.sink.error(e);
  }
}

export default Flatten;
