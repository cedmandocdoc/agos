const { create } = require("../dist/agos.cjs");

const interval = (duration, take = Infinity) =>
  create(control => {
    let id = 0;
    let count = 0;

    const open = control.open(dispatch => {
      dispatch();
      id = setInterval(() => {
        next(++count);
        if (count >= take) close();
      }, duration);
    });

    const next = control.next((dispatch, data) => {
      dispatch(data);
    });

    const close = control.close(dispatch => {
      clearInterval(id);
      id = 0;
      count = 0;
      dispatch();
    });

    return { open, close, setCount: () => (count = 0) };
  });

exports.interval = interval;
