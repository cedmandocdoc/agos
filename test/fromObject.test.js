const { pipe, listen, fromObject, CancelSignal } = require("../dist/agos.cjs");

describe("fromObject", () => {
  it("should propagate each value of object", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(fromObject({ 1: 1, 2: 2, 3: 3 }), listen({ open, next, fail, done }));

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3]);
  });

  it("should propagate each value and key in object", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      fromObject({ 1: 1, 2: 2, 3: 3 }, true),
      listen({ open, next, fail, done })
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([
      [1, "1"],
      [2, "2"],
      [3, "3"]
    ]);
  });

  it("should propagate cancellation on open", () => {
    const received = [];
    const cancel = new CancelSignal();

    const open = jest.fn(() => cancel.run());
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(
      fromObject({ 1: 1, 2: 2, 3: 3 }),
      listen({ open, next, fail, done }, cancel)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([]);
  });

  it("should propagate cancellation on next", () => {
    const received = [];
    const cancel = new CancelSignal();

    const open = jest.fn();
    const next = jest.fn(value => {
      received.push(value);
      if (value >= 2) cancel.run();
    });
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(
      fromObject({ 1: 1, 2: 2, 3: 3 }),
      listen({ open, next, fail, done }, cancel)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2]);
  });

  it("should not propagate cancellation on both before open and next", () => {
    const received = [];
    const cancel = new CancelSignal();

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    cancel.run();

    pipe(
      fromObject({ 1: 1, 2: 2, 3: 3 }),
      listen({ open, next, fail, done }, cancel)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3]);
  });

  it("should not propagate cancellation on both after open and next", () => {
    const received = [];
    const cancel = new CancelSignal();

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      fromObject({ 1: 1, 2: 2, 3: 3 }),
      listen({ open, next, fail, done }, cancel)
    );

    cancel.run();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3]);
  });
});
