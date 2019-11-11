import Sink from "../Sink";

class Slice {
  constructor(producer, start = 0, end = Infinity) {
    this.producer = producer;
    this.start = start;
    this.end = end;
  }

  static join(producer, start = 0, end = Infinity) {
    return producer instanceof Slice
      ? new Slice(
          producer.producer,
          start < 0 ? start : producer.start + start,
          end < producer.end ? end : producer.end
        )
      : new Slice(producer, start, end);
  }

  run(sink, state) {
    return this.producer.run(
      this.start < 0 || this.end < 0
        ? new FutureSink(sink, state, this.start, this.end)
        : new SliceSink(sink, state, this.start, this.end),
      state
    );
  }
}

class SliceSink extends Sink {
  constructor(sink, state, start, end) {
    super(sink, state);
    this.start = start;
    this.end = end;
    this.count = 0;
  }

  next(d) {
    this.count++;
    this.count > this.start && this.sink.next(d);
    this.count >= this.end && this.sink.complete();
  }
}

class FutureSink extends Sink {
  constructor(sink, state, start, end) {
    super(sink, state);
    this.start = start;
    this.end = end;
    this.count = 0;
    this.values = [];
  }

  next(d) {
    this.values.push(d);
  }

  complete() {
    const values = this.values.slice(this.start, this.end);
    for (let index = 0; index < values.length; index++) {
      this.sink.next(values[index]);
    }
    this.sink.complete();
  }
}

export default Slice;
