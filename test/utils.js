const Stream = require("../dist/agos.cjs");

const interval = (duration, take = Infinity) => {
  const stop = jest.fn(id => clearInterval(id));

  const stream = new Stream(sink => {
    let count = 0;
    const id = setInterval(() => {
      sink.next(++count);
      if (count >= take) sink.complete();
    }, duration);
    return { stop: () => stop(id) };
  });

  return [stream, stop];
};

exports.Stream = Stream;
exports.interval = interval;
