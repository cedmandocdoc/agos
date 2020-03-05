const { interval } = require("./utils");
const { pipe, listen, concat, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("concat", () => {
  it("should propagate all values from sources one after another completes", () => {
    const expected = [1, 2, 3, 1, 2];

    const open = jest.fn();
    const next = jest.fn(data => expect(data).toEqual(expected.shift()));
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      concat([interval(100, 3), interval(200, 2)]),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(700);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(5);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when any source propagates an error", () => {
    const expected = [1, 2, 3];
    const err = new Error();

    const open = jest.fn();
    const next = jest.fn(data => expect(data).toEqual(expected.shift()));
    const error = jest.fn(data => expect(data).toEqual(err));
    const close = jest.fn();
    const project = map(() => {
      throw err;
    });

    const control = pipe(
      concat([interval(100, 3), project(interval(200, 2))]),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(700);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenCalledTimes(2);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
