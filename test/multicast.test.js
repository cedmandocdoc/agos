const { interval } = require("./utils");
const {
  pipe,
  listen,
  multicast,
  never,
  teardown
} = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("multicast", () => {
  it("should share the value across all listeners", () => {
    const received1 = [];
    const received2 = [];
    const source = multicast(interval(100, 3));

    const open1 = jest.fn();
    const next1 = jest.fn(value => received1.push(value));
    const fail1 = jest.fn();
    const done1 = jest.fn(cancelled => expect(cancelled).toEqual(false));

    const open2 = jest.fn();
    const next2 = jest.fn(value => received2.push(value));
    const fail2 = jest.fn();
    const done2 = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      source,
      listen(open1, next1, fail1, done1)
    );

    pipe(
      source,
      listen(open2, next2, fail2, done2)
    );

    jest.advanceTimersByTime(300);

    expect(open1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenCalledTimes(3);
    expect(fail1).toHaveBeenCalledTimes(0);
    expect(done1).toHaveBeenCalledTimes(1);
    expect(received1).toEqual([1, 2, 3]);

    expect(open2).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenCalledTimes(3);
    expect(fail2).toHaveBeenCalledTimes(0);
    expect(done2).toHaveBeenCalledTimes(1);
    expect(received2).toEqual([1, 2, 3]);
  });

  it("should propagate cancellation", () => {
    const received1 = [];
    const received2 = [];
    const source = multicast(interval(100, 3));

    const open1 = jest.fn();
    const next1 = jest.fn(value => received1.push(value));
    const fail1 = jest.fn();
    const done1 = jest.fn(cancelled => expect(cancelled).toEqual(false));

    const open2 = jest.fn();
    const next2 = jest.fn(value => received2.push(value));
    const fail2 = jest.fn();
    const done2 = jest.fn(cancelled => expect(cancelled).toEqual(true));
    const abort = teardown(never());

    pipe(
      source,
      listen(open1, next1, fail1, done1)
    );

    pipe(
      source,
      listen(open2, next2, fail2, done2, abort)
    );

    setTimeout(() => abort.run(), 200);

    jest.advanceTimersByTime(300);

    expect(open1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenCalledTimes(3);
    expect(fail1).toHaveBeenCalledTimes(0);
    expect(done1).toHaveBeenCalledTimes(1);
    expect(received1).toEqual([1, 2, 3]);

    expect(open2).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenCalledTimes(2);
    expect(fail2).toHaveBeenCalledTimes(0);
    expect(done2).toHaveBeenCalledTimes(1);
    expect(received2).toEqual([1, 2]);
  });
});
