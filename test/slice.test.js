const { interval } = require("./utils");
const { pipe, listen, slice } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("slice", () => {
  it("should propagate selected values: positive start and positive end acts as slice between", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(
      interval(100, 10),
      slice(4, 8),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(4);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([5, 6, 7, 8]);
  });

  it("should propagate selected values: positive start acts as skip from start", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 10),
      slice(4),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(6);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it("should propagate selected values: positive end acts as take from start then completes", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(
      interval(100, 10),
      slice(0, 4),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(4);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3, 4]);
  });

  it("should propagate selected values: negative start acts as take from end", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 10),
      slice(-4),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(4);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([7, 8, 9, 10]);
  });

  it("should propagate selected values: negative end acts as skip from end", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 10),
      slice(0, -4),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(6);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("should propagate selected values: negative start and negative end acts as slice intersect", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 10),
      slice(-7, -5),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([4, 5]);
  });
});
