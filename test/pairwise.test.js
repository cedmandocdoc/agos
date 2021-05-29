const { interval } = require("./utils");
const { pipe, listen, pairwise, emitter } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("pairwise", () => {
  it("should propagate previous and current value of stream", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 3),
      pairwise(),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([[1, 2], [2, 3]]);
  });

  it("should propagate previous and current value of emitter stream", () => {
    const received = [];
    const [control, subject] = emitter({ immediate: true });

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    control.open();
    control.next(1);

    pipe(
      subject,
      pairwise(),
      listen({ open, next, fail, done })
    );

    control.next(2);
    control.done(false);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([[1, 2]]);
  });
});
