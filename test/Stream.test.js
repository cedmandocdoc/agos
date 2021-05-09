const $$observable = require("symbol-observable").default;
const { pipe, map } = require("../dist/agos.cjs");
const { interval } = require("./utils");

jest.useFakeTimers();

describe("Stream", () => {
  it("should implement interoperability in observable", () => {
    const received = [];

    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    const observable = interval(100, 3)[$$observable]();

    observable.subscribe({
      next,
      error: fail,
      complete: done
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3]);
  });

  it("should implement interoperability of observable subscription", () => {
    const received = [];

    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    const observable = interval(100, 3)[$$observable]();

    const subscription = observable.subscribe({
      next,
      error: fail,
      complete: done
    });

    setTimeout(() => subscription.unsubscribe(), 200);

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2]);
  });

  it("should implement interoperability of observable throwing an error", () => {
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    const observable = pipe(
      interval(100, 3),
      map(() => {
        throw new Error();
      })
    )[$$observable]();

    observable.subscribe({
      next,
      error: fail,
      complete: done
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(3);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
