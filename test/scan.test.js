const { interval } = require("./utils");
const { pipe, listen, scan } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("scan", () => {
  it("should accumulate data through accumulator function then propagates", () => {
    const expected = [1, 3, 6];

    const open = jest.fn();
    const next = jest.fn(data => expect(data).toEqual(expected.shift()));
    const error = jest.fn();
    const close = jest.fn();
    const accumulator = jest.fn((acc, curr) => acc + curr);

    const control = pipe(
      interval(100, 3),
      scan(accumulator, 0),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
    expect(accumulator).toHaveBeenCalledTimes(3);
  });

  it("should propagate error when accumulator function throws", () => {
    const expected = [1, 3, 6];
    const err = new Error();

    const open = jest.fn();
    const next = jest.fn(data => expect(data).toEqual(expected.shift()));
    const error = jest.fn();
    const close = jest.fn();
    const accumulator = jest.fn((acc, curr) => {
      if (curr === 3) throw err;
      return acc + curr;
    });

    const control = pipe(
      interval(100, 3),
      scan(accumulator, 0),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(accumulator).toHaveBeenCalledTimes(3);
  });
});
