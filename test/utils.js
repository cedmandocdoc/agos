const { create } = require("../dist/agos.cjs");

const interval = (duration, take = Infinity) =>
  create(control => {
    let id = 0;
    let count = 0;

    const open = control.open(done => {
      done();
      id = setInterval(() => {
        control.next(++count);
        if (count >= take) close();
      }, duration);
    });

    const close = control.close(done => {
      clearInterval(id);
      id = 0;
      count = 0;
      done();
    });

    return { open, close, setCount: () => (count = 0) };
  });

exports.interval = interval;
