const { create, Stream, pipe, filter, listen } = require("../dist/agos.cjs");

const noop = () => {};

const interval = (duration, take = Infinity, cancel = noop) =>
  create((open, next, fail, done, talkback) => {
    let count = 0;
    const id = setInterval(() => {
      next(++count);
      if (count >= take) {
        clearInterval(id);
        done(false);
      }
    }, duration);

    pipe(
      talkback,
      filter(data => data === Stream.CANCEL),
      listen(() => {
        clearInterval(id);
        done(true);
        cancel();
      })
    );

    open();
  });

exports.noop = noop;
exports.interval = interval;
