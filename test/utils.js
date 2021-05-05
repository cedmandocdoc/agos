const { create, never, Stream } = require("../dist/agos.cjs");

const noop = () => { };

const interval = (duration, take = Infinity) =>
  create((open, next, fail, done, talkback) => {
    let count = 0;

    const id = setInterval(() => {
      next(++count);
      if (count >= take) {
        clearInterval(id);
        done(false);
      }
    }, duration);

    talkback.listen(
      noop,
      payload => {
        if (payload === Stream.CANCEL) {
          clearInterval(id);
          done(true);
        }
      },
      noop,
      noop,
      never
    );
    open();
  });

exports.noop = noop;
exports.interval = interval;
