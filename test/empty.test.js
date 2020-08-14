const {
  pipe,
  listen,
  empty,
  never,
  CancelInterceptor
} = require("../dist/agos.cjs");

describe("empty", () => {
  it("should propagate completion", () => {
    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      empty(),
      listen(open, next, fail, done)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should propagate cancellation on open", () => {
    const cancel = CancelInterceptor.join(never());

    const open = jest.fn(() => cancel.run());
    const next = jest.fn();
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(
      empty(),
      listen(open, next, fail, done, cancel)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should not propagate cancellation before open", () => {
    const cancel = CancelInterceptor.join(never());

    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    cancel.run();

    pipe(
      empty(),
      listen(open, next, fail, done, cancel)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should not propagate cancellation after open", () => {
    const cancel = CancelInterceptor.join(never());

    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      empty(),
      listen(open, next, fail, done, cancel)
    );

    cancel.run();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
