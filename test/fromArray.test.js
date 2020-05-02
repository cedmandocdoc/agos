const {
  pipe,
  listen,
  fromArray,
  never,
  teardown
} = require("../dist/agos.cjs");

describe("fromArray", () => {
  it("should propagate each value on array", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      fromArray([1, 2, 3]),
      listen(open, next, fail, done)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([[1, 0], [2, 1], [3, 2]]);
  });

  it("should propagate cancellation on open", () => {
    const received = [];
    const abort = teardown(never());

    const open = jest.fn(() => abort.run());
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(
      fromArray([1, 2, 3]),
      listen(open, next, fail, done, abort)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([]);
  });

  it("should propagate cancellation on next", () => {
    const received = [];
    const abort = teardown(never());

    const open = jest.fn();
    const next = jest.fn(([value, index]) => {
      received.push([value, index]);
      if (value >= 2) abort.run();
    });
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(
      fromArray([1, 2, 3]),
      listen(open, next, fail, done, abort)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([[1, 0], [2, 1]]);
  });

  it("should not propagate cancellation on both before open and next", () => {
    const received = [];
    const abort = teardown(never());

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    abort.run();

    pipe(
      fromArray([1, 2, 3]),
      listen(open, next, fail, done, abort)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([[1, 0], [2, 1], [3, 2]]);
  });

  it("should not propagate cancellation on both after open and next", () => {
    const received = [];
    const abort = teardown(never());

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      fromArray([1, 2, 3]),
      listen(open, next, fail, done, abort)
    );

    abort.run();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([[1, 0], [2, 1], [3, 2]]);
  });
});
