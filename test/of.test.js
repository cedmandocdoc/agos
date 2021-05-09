const {
  pipe,
  listen,
  of,
  never,
  CancelInterceptor
} = require("../dist/agos.cjs");

describe("of", () => {
  it("should propagate the given value", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      of(1),
      listen({ open, next, fail, done })
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should propagate cancellation on open", () => {
    const received = [];
    const cancel = CancelInterceptor.join(never());

    const open = jest.fn(() => cancel.run());
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(
      of(1),
      listen({ open, next, fail, done }, cancel)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should not propagate cancellation before open", () => {
    const received = [];
    const cancel = CancelInterceptor.join(never());

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    cancel.run();

    pipe(
      of(1),
      listen({ open, next, fail, done }, cancel)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should not propagate cancellation after open", () => {
    const received = [];
    const cancel = CancelInterceptor.join(never());

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      of(1),
      listen({ open, next, fail, done }, cancel)
    );

    cancel.run();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
