const { interval } = require("./utils");
const { pipe, listen, merge, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("merge", () => {
  it("should propagate all values from sources", () => {
    const expected = [[1, 0], [2, 0], [1, 1], [3, 0], [2, 1]];

    const open = jest.fn();
    const next = jest.fn(value => expect(value).toEqual(expected.shift()));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      merge([interval(100, 3), interval(200, 2)]),
      listen(open, next, fail, done)
    );

    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(5);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when any source propagates an error", () => {
    const expected = [[1, 0], [2, 0], [3, 0]];
    const error = new Error();

    const open = jest.fn();
    const next = jest.fn(value => expect(value).toEqual(expected.shift()));
    const fail = jest.fn(value => expect(value).toEqual([error, 1]));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const project = map(() => {
      throw error;
    });

    pipe(
      merge([interval(100, 3), project(interval(200, 2))]),
      listen(open, next, fail, done)
    );

    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(2);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
