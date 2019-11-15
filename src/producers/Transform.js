import Sink from "../Sink";

class Transform {
  constructor(producer, fn) {
    this.producer = producer;
    this.fn = fn;
  }

  static join(producer, fn) {
    return producer instanceof Transform
      ? new Transform(producer.producer, d => fn(producer.fn(d)))
      : new Transform(producer, fn);
  }

  run(sink, state) {
    return this.producer.run(new TransformSink(sink, this.fn), state);
  }
}

class TransformSink extends Sink {
  constructor(sink, fn) {
    super(sink);
    this.fn = fn;
  }

  next(d) {
    this.sink.next(this.fn(d));
  }
}

export default Transform;
