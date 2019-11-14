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
    const flatten = new FlattenSink(sink, new FlattenState(), 0);
    flatten.state.inprogress++;

    const control = this.producer.run(flatten, state);
    flatten.state.teardowns[0] = control.stop;

    return {
      ...control,
      stop: () => {
        for (let index = 0; index < flatten.state.teardowns; index++) {
          const teardown = flatten.state.teardowns[index];
          teardown();
        }
        flatten.state.teardowns = [];
        flatten.state.inprogress = 0;
      }
    };
  }
}

class FlattenState {
  constructor() {
    this.teardowns = [];
    this.inprogress = 0;
  }
}

class FlattenSink extends Sink {
  constructor(sink, state, index) {
    super(sink);
    this.state = state;
    this.index = index;
  }

  next(d) {
    if (d instanceof Stream) {
      const producer = Teardown.join(Guard.join(d.producer));
      this.state.inprogress++;
      const control = producer.run(
        new FlattenSink(this.sink, this.state, this.index + 1),
        new State()
      );
      this.state.teardowns[this.index + 1] = control.stop;
    } else {
      this.sink.next(d);
    }
  }

  complete() {
    this.state.inprogress--;
    this.state.teardowns[this.index] = () => {};
    if (this.state.inprogress <= 0) this.sink.complete();
  }
}

export default Flatten;
