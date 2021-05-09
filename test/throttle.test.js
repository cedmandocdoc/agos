const { interval } = require("./utils");
const { pipe, listen, throttle } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("throttle", () => {
  it("should throttle propagation through tick function", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const tick = jest.fn((release, value) => {
      expect(value).toEqual(1);
      setTimeout(release, 200);
    });

    pipe(
      interval(100, 3),
      throttle(tick),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(400);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(tick).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should propagate error when tick function throws", () => {
    const received = [];
    const error = new Error();

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn(value => expect(value).toEqual(error));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const tick = jest.fn((release, value) => {
      expect(value).toEqual(1);
      throw error;
    });

    pipe(
      interval(100, 3),
      throttle(tick),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
    expect(tick).toHaveBeenCalledTimes(1);
    expect(received).toEqual([]);
  });
});
