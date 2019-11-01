const Stream = require("../dist/agos.cjs");

const createInterval = (duration, complete = Infinity) => {
  let id;
  const stop = jest.fn().mockImplementation(() => clearInterval(id));

  const stream = new Stream(sink => {
    let count = 0;
    id = setInterval(() => {
      sink.next(++count);
      if (count >= complete) sink.complete();
    }, duration);
    return { stop };
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
