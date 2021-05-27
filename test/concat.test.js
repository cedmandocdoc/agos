const { interval } = require("./utils");
const { pipe, listen, concat, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("concat", () => {
  it("should propagate all values from sources one after another completes acting as a main source", () => {
    const expected = [1, 2, 3, 1, 2];

    const open = jest.fn();
    const next = jest.fn(value => expect(value).toEqual(expected.shift()));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      concat([interval(100, 3), interval(200, 2)]),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(700);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(5);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should propagate all values from sources one after another completes acting as an operator", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 3),
      concat(interval(200, 2)),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(1000);
    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(5);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3, 1, 2]);
  });

  it("should propagate error when any source propagates an error", () => {
    const expected = [1, 2, 3];
    const error = new Error();

    const open = jest.fn();
    const next = jest.fn(value => expect(value).toEqual(expected.shift()));
    const fail = jest.fn(value => expect(value).toEqual(error));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const project = map(() => {
      throw error;
    });

    pipe(
      concat([interval(100, 3), project(interval(200, 2))]),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(700);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(2);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
