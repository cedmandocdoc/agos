import Sink from "../Sink";

class Safe {
  constructor(producer) {
    this.producer = producer;
  }

  static join(producer) {
    return producer instanceof Safe ? producer : new Safe(producer);
  }

  run(sink, state) {
    return this.producer.run(new SafeSink(sink), state);
  }
}

class SafeSink extends Sink {
  constructor(sink) {
    super(sink);
  }

  next(d) {
    try {
      this.sink.next(d);
    } catch (e) {
      this.sink.error(e);
    }
  }
}

export default Safe;
