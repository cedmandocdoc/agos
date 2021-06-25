const { interval } = require("./utils");
const { pipe, listen, mergeLatest, map, of } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("mergeLatest", () => {
  it("should propagate all latest values from sources", () => {
    const expected = [
      [2, 1],
      [3, 1],
      [3, 2]
    ];

    const open = jest.fn();
    const next = jest.fn(value => expect(value).toEqual(expected.shift()));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      mergeLatest([interval(100, 3), interval(200, 2)]),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when any source propagates an error", () => {
    const expected = [
      [2, 1],
      [3, 1]
    ];
    const error = new Error();

    const open = jest.fn();
    const next = jest.fn(value => expect(value).toEqual(expected.shift()));
    const fail = jest.fn(value => expect(value).toEqual(error));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const project = map(value => {
      if (value === 2) throw error;
      return value;
    });

    pipe(
      mergeLatest([interval(100, 3), project(interval(200, 2))]),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should propagate all latest values from sources, one sync and one async", () => {
    const expected = [
      [1, 1],
      [2, 1],
      [3, 1]
    ];

    const open = jest.fn();
    const next = jest.fn(value => expect(value).toEqual(expected.shift()));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      mergeLatest([interval(100, 3), of(1)]),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
