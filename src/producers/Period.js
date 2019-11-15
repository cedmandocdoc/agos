import Sink from "../Sink";

class Period {
  constructor(producer, fn) {
    this.producer = producer;
    this.fn = fn;
  }

  static join(producer, fn) {
    return producer instanceof Period
      ? new Period(producer.producer, d => producer.fn(d) || fn(d))
      : new Period(producer, fn);
  }

  run(sink, state) {
    return this.producer.run(new PeriodSink(sink, this.fn), state);
  }
}

class PeriodSink extends Sink {
  constructor(sink, fn) {
    super(sink);
    this.fn = fn;
  }

  next(d) {
    if (!this.fn(d)) return this.sink.complete();
    this.sink.next(d);
  }
}

export default Period;
