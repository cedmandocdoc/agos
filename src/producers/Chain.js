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
    const main = new MainSink(sink, state, this.fns);
    main.inprogress++; // increment in progress before start

    const control = this.producer.run(main, state);
    main.teardowns[0] = control.stop;

    return {
      ...control,
      stop: () => {
        for (let index = 0; index < main.teardowns; index++) {
          const teardown = main.teardowns[index];
          teardown();
        }
        main.teardowns = [];
        main.inprogress = 0;
      }
    };
  }
}

class MainSink extends Sink {
  constructor(sink, state, fns) {
    super(sink, state);
    this.fns = fns;
    this.teardowns = [];
    this.inprogress = 0;
  }

  next(d) {
    const fn = this.fns[0];
    const stream = fn(d);
    const sink = new RecursiveSink(this.sink, this.state, this.fns, 1, this);
    this.inprogress++; // increment in progress before start
    const producer = Teardown.join(Guard.join(stream.producer));
    const control = producer.run(sink, new State());
    this.teardowns[1] = control.stop;
  }

  complete() {
    this.inprogress--;
    this.teardowns[0] && this.teardowns[0]();
    this.teardowns[0] = () => {}; // clear main when complete
    this.end(); // try dispatch all complete
  }

  end() {
    if (this.inprogress <= 0) this.sink.complete();
  }
}

class RecursiveSink extends Sink {
  constructor(sink, state, fns, index, main) {
    super(sink, state);
    this.fns = fns;
    this.index = index;
    this.main = main;
  }

  next(d) {
    if (this.index >= this.fns.length) return this.sink.next(d);
    const fn = this.fns[this.index];
    const stream = fn(d);
    const sink = new RecursiveSink(
      this.sink,
      this.state,
      this.fns,
      this.index + 1,
      this.main
    );
    this.main.inprogress++;
    const producer = Teardown.join(Guard.join(stream.producer));
    const control = producer.run(sink, new State());
    this.main.teardowns[this.index + 1] = control.stop;
  }

  complete() {
    this.main.inprogress--;
    // clear when current propagate complete
    this.main.teardowns[this.index] = () => {};
    this.main.end(); // try to dispatch all complete
  }

  error(e) {
    // clear when current propagates error, since stream were auto tearing down by default
    this.main.teardowns[this.index] = () => {};
    this.main.error(e);
  }
}

export default Chain;
