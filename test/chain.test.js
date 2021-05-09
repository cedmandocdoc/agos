const { interval } = require("./utils");
const { pipe, listen, chain, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("chain", () => {
  it("should flattened the source through project function: one chain one emit", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 1),
      chain(() => interval(200, 1)),
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
      chain(() => interval(200, 2)),
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
      chain(() => interval(200, 1)),
      chain(() => interval(300, 1)),
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
      chain(() => interval(200, 2)),
      chain(() => interval(300, 3)),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(6);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 1, 2, 2, 3, 3]);
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
      chain(() => interval(200, 2)),
      chain(() => project),
      chain(() => interval(300, 3)),
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
      chain(() => project(interval(200, 2))),
      chain(() => project(interval(300, 3))),
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
