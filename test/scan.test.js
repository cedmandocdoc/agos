const { interval } = require("./utils");
const { pipe, listen, scan } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("scan", () => {
  it("should accumulate values through accumulator function then propagate", () => {
    const expected = [1, 3, 6];

    const open = jest.fn();
    const next = jest.fn(value => expect(value).toEqual(expected.shift()));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const accumulator = jest.fn((acc, curr) => acc + curr);

    pipe(
      interval(100, 3),
      scan(accumulator, 0),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(accumulator).toHaveBeenCalledTimes(3);
  });

  it("should propagate error when accumulator function throws", () => {
    const expected = [1, 3, 6];
    const error = new Error();

    const open = jest.fn();
    const next = jest.fn(value => expect(value).toEqual(expected.shift()));
    const fail = jest.fn(value => expect(value).toEqual(error));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const accumulator = jest.fn((acc, curr) => {
      if (curr === 3) throw error;
      return acc + curr;
    });

    pipe(
      interval(100, 3),
      scan(accumulator, 0),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
    expect(accumulator).toHaveBeenCalledTimes(3);
  });
});
