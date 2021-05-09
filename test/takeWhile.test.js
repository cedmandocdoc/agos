const { interval } = require("./utils");
const { pipe, listen, takeWhile } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("takeWhile", () => {
  it("should propagate value when period function returns true, then completes", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));
    const period = jest.fn(value => value < 3);

    pipe(
      interval(100, 3),
      takeWhile(period),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(period).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 2]);
  });

  it("should propagate value when period function returns true, then completes: with inclusive should propagate last value", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));
    const period = jest.fn(value => value < 3);

    pipe(
      interval(100, 5),
      takeWhile(period, true),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(period).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 2, 3]);
  });

  it("should propagate value with nested period, then completes: first period returns first", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));
    const firstPeriod = jest.fn(value => value < 3);
    const secondPeriod = jest.fn(value => value < 4);

    pipe(
      interval(100, 5),
      takeWhile(firstPeriod),
      takeWhile(secondPeriod),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(firstPeriod).toHaveBeenCalledTimes(3);
    expect(secondPeriod).toHaveBeenCalledTimes(2);
    expect(received).toEqual([1, 2]);
  });

  it("should propagate value with nested period, then completes: second period returns first", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));
    const firstPeriod = jest.fn(value => value < 4);
    const secondPeriod = jest.fn(value => value < 3);

    pipe(
      interval(100, 5),
      takeWhile(firstPeriod),
      takeWhile(secondPeriod),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(firstPeriod).toHaveBeenCalledTimes(3);
    expect(secondPeriod).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 2]);
  });

  it("should propagate value with nested period, then completes: first period returns first, with inclusive", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));
    const firstPeriod = jest.fn(value => value < 3);
    const secondPeriod = jest.fn(value => value < 4);

    pipe(
      interval(100, 5),
      takeWhile(firstPeriod, true),
      takeWhile(secondPeriod),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(firstPeriod).toHaveBeenCalledTimes(3);
    expect(secondPeriod).toHaveBeenCalledTimes(2);
    expect(received).toEqual([1, 2, 3]);
  });

  it("should propagate value with nested period, then completes: second period returns first, with inclusive", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));
    const firstPeriod = jest.fn(value => value < 4);
    const secondPeriod = jest.fn(value => value < 3);

    pipe(
      interval(100, 5),
      takeWhile(firstPeriod),
      takeWhile(secondPeriod, true),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(firstPeriod).toHaveBeenCalledTimes(3);
    expect(secondPeriod).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 2, 3]);
  });

  it("should propagate error when period argument throws", () => {
    const received = [];
    const error = new Error();

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn(value => expect(value).toEqual(error));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const period = jest.fn(value => {
      if (value === 2) throw error;
      return value < 4;
    });

    pipe(
      interval(100, 3),
      takeWhile(period),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
    expect(period).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 3]);
  });
});
