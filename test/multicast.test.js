const { interval } = require("./utils");
const {
  pipe,
  listen,
  multicast,
  empty,
  CancelInterceptor,
  fromArray
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
      listen({ open: open1, next: next1, fail: fail1, done: done1 })
    );

    pipe(
      source,
      listen({ open: open2, next: next2, fail: fail2, done: done2 })
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

  it("should share the value across all listeners with sync source should revives each time", () => {
    const received1 = [];
    const received2 = [];
    const source = multicast(fromArray([1, 2, 3]));

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
      listen({ open: open1, next: next1, fail: fail1, done: done1 })
    );

    pipe(
      source,
      listen({ open: open2, next: next2, fail: fail2, done: done2 })
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

  it("should share the value immediately across all in the middle listeners", () => {
    const received1 = [];
    const received2 = [];
    const source = multicast(interval(100, 3), { immediate: true });

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
      listen({ open: open1, next: next1, fail: fail1, done: done1 })
    );

    setTimeout(() => {
      pipe(
        source,
        listen({ open: open2, next: next2, fail: fail2, done: done2 })
      );
    }, 250);

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
    expect(received2).toEqual([2, 3]);
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
    const cancel = CancelInterceptor.join(empty());

    pipe(
      source,
      listen({ open: open1, next: next1, fail: fail1, done: done1 })
    );

    pipe(
      source,
      listen({ open: open2, next: next2, fail: fail2, done: done2 }, cancel)
    );

    setTimeout(() => cancel.run(), 200); // all listeneres will be cancelled

    jest.advanceTimersByTime(400);

    expect(open1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenCalledTimes(2);
    expect(fail1).toHaveBeenCalledTimes(0);
    expect(done1).toHaveBeenCalledTimes(1);
    expect(received1).toEqual([1, 2]);

    expect(open2).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenCalledTimes(2);
    expect(fail2).toHaveBeenCalledTimes(0);
    expect(done2).toHaveBeenCalledTimes(1);
    expect(received2).toEqual([1, 2]);
  });

  it("should be revived after cancellation", () => {
    const received1 = [];
    const received2 = [];
    const source = multicast(interval(100, 3));
    const cancel = CancelInterceptor.join(empty());

    const open1 = jest.fn();
    const next1 = jest.fn(value => received1.push(value));
    const fail1 = jest.fn();
    const done1 = jest.fn(cancelled => expect(cancelled).toEqual(true));

    const open2 = jest.fn();
    const next2 = jest.fn(value => received2.push(value));
    const fail2 = jest.fn();
    const done2 = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      source,
      listen({ open: open1, next: next1, fail: fail1, done: done1 }, cancel)
    );

    setTimeout(() => cancel.run(), 200);

    setTimeout(() => {
      pipe(
        source, // revived source after previous cancellation
        listen({ open: open2, next: next2, fail: fail2, done: done2 })
      );
    }, 200);

    jest.advanceTimersByTime(500);

    expect(open1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenCalledTimes(2);
    expect(fail1).toHaveBeenCalledTimes(0);
    expect(done1).toHaveBeenCalledTimes(1);
    expect(received1).toEqual([1, 2]);

    expect(open2).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenCalledTimes(3);
    expect(fail2).toHaveBeenCalledTimes(0);
    expect(done2).toHaveBeenCalledTimes(1);
    expect(received2).toEqual([1, 2, 3]);
  });
});
