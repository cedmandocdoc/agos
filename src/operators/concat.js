import { Operator } from "../Stream";
import { noop } from "../utils";

class Concat extends Operator {
  constructor(source, streams) {
    super(source);
    this.streams = streams;
  }

  static join(stream, concatStream) {
    return stream instanceof Concat
      ? new Concat(stream.source, [...stream.streams, concatStream])
      : super.join(stream, [concatStream]);
  }

  listen(open, next, fail, done, talkback) {
    const run = index => {
      const stream = this.streams[index];
      stream.listen(
        noop,
        next,
        fail,
        () => (index >= this.streams.length - 1 ? done(false) : run(index + 1)),
        talkback
      );
    };

    this.source(
      open,
      next,
      fail,
      () => (this.streams.length === 0 ? done(false) : run(0)),
      talkback
    );
  }
}

// function overloading for creating stream or using as an operator
const concat = streams =>
  Array.isArray(streams) && streams.length
    ? new Concat(streams[0].source, streams.slice(1))
    : stream => Concat.join(stream, streams);

export default concat;
