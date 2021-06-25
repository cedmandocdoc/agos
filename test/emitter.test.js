const { pipe, listen, emitter, CancelSignal } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("map", () => {
  it("should propagate values upon calling next", () => {
    const received = [];

    const [control, subject] = emitter();

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    control.open();
    control.next(1); // should not be propagated

    pipe(subject, listen({ open, next, fail, done }));

    control.next(2);
    control.next(3);
    control.done(false);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([2, 3]);
  });

  it("should propagate the last value immediately upon calling next on succeding listeners", () => {
    const received = [];

    const [control, subject] = emitter({ immediate: true });

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    control.open();
    control.next(1); // should propagate

    pipe(subject, listen({ open, next, fail, done }));

    control.next(2);
    control.next(3);
    control.done(false);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3]);
  });

  it("should propagate values upon calling next on current listeners", () => {
    const received1 = [];
    const received2 = [];

    const [control, subject] = emitter();

    const open1 = jest.fn();
    const next1 = jest.fn(value => received1.push(value));
    const fail1 = jest.fn();
    const done1 = jest.fn(cancelled => expect(cancelled).toEqual(false));

    const open2 = jest.fn();
    const next2 = jest.fn(value => received2.push(value));
    const fail2 = jest.fn();
    const done2 = jest.fn(cancelled => expect(cancelled).toEqual(false));

    control.open();
    control.next(1); // should not propagate

    pipe(
      subject,
      listen({ open: open1, next: next1, fail: fail1, done: done1 })
    );

    control.next(2); //  should propagate on current listeners but not on succeeding

    pipe(
      subject,
      listen({ open: open2, next: next2, fail: fail2, done: done2 })
    );

    control.next(3);
    control.done(false);

    expect(open1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenCalledTimes(2);
    expect(fail1).toHaveBeenCalledTimes(0);
    expect(done1).toHaveBeenCalledTimes(1);
    expect(received1).toEqual([2, 3]);

    expect(open2).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenCalledTimes(1);
    expect(fail2).toHaveBeenCalledTimes(0);
    expect(done2).toHaveBeenCalledTimes(1);
    expect(received2).toEqual([3]);
  });

  it("should not propagate values on cancelled listeners but continue propagation on succeeding", () => {
    const received1 = [];
    const received2 = [];

    const [control, subject] = emitter();
    const cancel = new CancelSignal();

    const open1 = jest.fn();
    const next1 = jest.fn(value => received1.push(value));
    const fail1 = jest.fn();
    const done1 = jest.fn(cancelled => expect(cancelled).toEqual(false));

    const open2 = jest.fn();
    const next2 = jest.fn(value => received2.push(value));
    const fail2 = jest.fn();
    const done2 = jest.fn(cancelled => expect(cancelled).toEqual(false));

    control.open();
    control.next(1); // should not propagate

    pipe(
      subject,
      listen({ open: open1, next: next1, fail: fail1, done: done1 }, cancel)
    );

    control.next(2);
    cancel.run();

    pipe(
      subject,
      listen({ open: open2, next: next2, fail: fail2, done: done2 })
    );

    control.next(3); // should not propagate on listener 1
    control.done(false);

    expect(open1).toHaveBeenCalledTimes(1);
    expect(next1).toHaveBeenCalledTimes(1);
    expect(fail1).toHaveBeenCalledTimes(0);
    expect(done1).toHaveBeenCalledTimes(1);
    expect(received1).toEqual([2]);

    expect(open2).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenCalledTimes(1);
    expect(fail2).toHaveBeenCalledTimes(0);
    expect(done2).toHaveBeenCalledTimes(1);
    expect(received2).toEqual([3]);
  });
});
