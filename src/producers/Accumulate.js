import Sink from "../Sink";

class Accumulate {
  constructor(producer, fn, seed) {
    this.producer = producer;
    this.fn = fn;
    this.seed = seed;
  }

  static join(producer, fn, seed) {
    return new Accumulate(producer, fn, seed);
  }

  run(sink, state) {
    return this.producer.run(
      new AccumulateSink(sink, state, this.fn, this.seed),
      state
    );
  }
}

class AccumulateSink extends Sink {
  constructor(sink, state, fn, seed) {
    super(sink, state);
    this.fn = fn;
    this.seed = seed;
  }

  next(d) {
    this.seed = this.fn(this.seed, d);
    this.sink.next(this.seed);
  }
}

export default Accumulate;
