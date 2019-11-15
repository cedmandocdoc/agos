import Sink from "../Sink";
import State from "../State";
import Teardown from "./Teardown";
import Guard from "./Guard";

class Chain {
  constructor(producer, fns) {
    this.producer = producer;
    this.fns = fns;
  }

  static join(producer, fns) {
    return producer instanceof Chain
      ? new Chain(producer.producer, [...producer.fns, ...fns])
      : new Chain(producer, fns);
  }

  run(sink, state) {
    const runner = new ChainRunner(this.fns);
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

class ChainRunner {
  constructor(fns) {
    this.fns = fns;
    this.teardowns = [];
    this.inprogress = 0;
  }

  run(sink, state, producer, index) {
    this.inprogress++;
    const control = producer.run(new ChainSink(sink, index, this), state);
    this.teardowns[index] = control.stop;
    return control;
  }
}

class ChainSink extends Sink {
  constructor(sink, index, runner) {
    super(sink);
    this.index = index;
    this.runner = runner;
  }

  next(d) {
    if (this.index >= this.runner.fns.length) return this.sink.next(d);
    const fn = this.runner.fns[this.index];
    const stream = fn(d);
    const producer = Teardown.join(Guard.join(stream.producer));
    this.runner.run(this.sink, new State(), producer, this.index + 1);
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

export default Chain;
