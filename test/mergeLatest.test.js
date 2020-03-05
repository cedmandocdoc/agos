const { interval } = require("./utils");
const { pipe, listen, mergeLatest, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("mergeLatest", () => {
  it("should propagate all latest values from sources", () => {
    const expected = [[2, 1], [3, 1], [3, 2]];

    const open = jest.fn();
    const next = jest.fn(data => expect(data).toEqual(expected.shift()));
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      mergeLatest([interval(100, 3), interval(200, 2)]),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when any source propagates an error", () => {
    const expected = [[2, 1], [3, 1]];
    const err = new Error();

    const open = jest.fn();
    const next = jest.fn(data => expect(data).toEqual(expected.shift()));
    const error = jest.fn(data => expect(data).toEqual(err));
    const close = jest.fn();
    const project = map(data => {
      if (data === 2) throw err;
      return data;
    });

    const control = pipe(
      mergeLatest([interval(100, 3), project(interval(200, 2))]),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
