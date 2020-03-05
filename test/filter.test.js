const { interval } = require("./utils");
const { pipe, listen, filter } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("filter", () => {
  it("should filter data when predicate function returns true", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();
    const predicate = jest.fn(data => data < 3);

    const control = pipe(
      interval(100, 3),
      filter(predicate),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
    expect(predicate).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 2]);
  });

  it("should propagate error when predicate function throws", () => {
    const received = [];
    const err = new Error();

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn(data => expect(data).toEqual(err));
    const close = jest.fn();
    const predicate = jest.fn(data => {
      if (data === 2) throw err;
      return data <= 3;
    });

    const control = pipe(
      interval(100, 3),
      filter(predicate),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(predicate).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 3]);
  });
});
