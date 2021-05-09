const { interval } = require("./utils");
const { pipe, listen, switchMap, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("switchMap", () => {
  it("should flattened the source through project function: one chain one emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 1),
      switchMap(() => interval(200, 1)),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should flattened the source through project function: one chain multiple emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 1),
      switchMap(() => interval(200, 2)),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(500);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2]);
  });

  it("should flattened the source through project function: multiple chain one emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 1),
      switchMap(() => interval(200, 1)),
      switchMap(() => interval(300, 1)),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(600);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should flattened the source through project function: multiple chain multiple emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 1),
      switchMap(() => interval(200, 2)),
      switchMap(() => interval(300, 3)),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(2000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3]);
  });

  it("should flattened the source through project function: source multiple emit one chain multiple emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(300, 2), // 300 or 201?
      switchMap(() => interval(100, 2)),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(5000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(4);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 1, 2]);
  });

  it("should propagate error when any project function throws an error", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const project = jest.fn(() => {
      throw new Error();
    });

    pipe(
      interval(100, 1),
      switchMap(() => interval(200, 2)),
      switchMap(() => project),
      switchMap(() => interval(300, 3)),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(2);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([]);
  });

  it("should propagate error when any source propagates an error", () => {
    const received = [];
    const error = new Error();

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const project = map(value => {
      if (value === 2) throw error;
      else return value;
    });

    pipe(
      interval(100, 1),
      switchMap(() => project(interval(200, 2))),
      switchMap(() => project(interval(300, 3))),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(2);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 3]);
  });
});
