const Stream = require("../dist/agos.cjs");

const createInterval = (duration, take = Infinity) => {
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

const stopInterval = (duration, stop) =>
  setTimeout(() => {
    stop();
  }, duration);

const throwError = error => () => {
  throw error;
};

exports.Stream = Stream;
exports.createInterval = createInterval;
exports.stopInterval = stopInterval;
exports.throwError = throwError;
