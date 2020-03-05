const { interval } = require("./utils");
const { pipe, listen, takeWhile } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("takeWhile", () => {
  it("should propagate data when period function returns true, then completes", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();
    const period = jest.fn(data => data < 3);

    const control = pipe(
      interval(100, 3),
      takeWhile(period),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
    expect(period).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 2]);
  });

  it("should propagate error when period argument throws", () => {
    const received = [];
    const err = new Error();

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn(data => expect(data).toEqual(err));
    const close = jest.fn();
    const period = jest.fn(data => {
      if (data === 2) throw err;
      return data < 4;
    });

    const control = pipe(
      interval(100, 3),
      takeWhile(period),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(period).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 3]);
  });
});
