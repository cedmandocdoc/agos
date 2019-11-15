import Sink from "../Sink";

class Filter {
  constructor(producer, fn) {
    this.producer = producer;
    this.fn = fn;
  }

  static join(producer, fn) {
    return producer instanceof Filter
      ? new Filter(producer.producer, d => producer.fn(d) && fn(d))
      : new Filter(producer, fn);
  }

  run(sink, state) {
    return this.producer.run(new FilterSink(sink, this.fn), state);
  }
}

class FilterSink extends Sink {
  constructor(sink, fn) {
    super(sink);
    this.fn = fn;
  }

  next(d) {
    this.fn(d) && this.sink.next(d);
  }
}

export default Filter;
