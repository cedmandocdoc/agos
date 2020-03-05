const { interval } = require("./utils");
const { pipe, listen, flatMap, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("flatMap", () => {
  it("should flattened the source through project function: one chain one emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      interval(100, 1),
      flatMap(() => interval(200, 1)),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should flattened the source through project function: one chain multiple emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      interval(100, 1),
      flatMap(() => interval(200, 2)),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(500);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2]);
  });

  it("should flattened the source through project function: multiple chain one emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      interval(100, 1),
      flatMap(() => interval(200, 1)),
      flatMap(() => interval(300, 1)),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(600);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should flattened the source through project function: multiple chain multiple emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      interval(100, 1),
      flatMap(() => interval(200, 2)),
      flatMap(() => interval(300, 3)),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(1400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(6);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it("should propagate error when any project function throws an error", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();
    const project = jest.fn(() => {
      throw new Error();
    });

    const control = pipe(
      interval(100, 1),
      flatMap(() => interval(200, 2)),
      flatMap(() => project),
      flatMap(() => interval(300, 3)),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(1400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledTimes(1);
    expect(received).toEqual([]);
  });

  it("should propagate error when any source propagates an error", () => {
    const received = [];
    const err = new Error();

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();
    const project = map(data => {
      if (data === 2) throw err;
      else return data;
    });

    const control = pipe(
      interval(100, 1),
      flatMap(() => project(interval(200, 2))),
      flatMap(() => project(interval(300, 3))),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(1400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 3]);
  });
});
