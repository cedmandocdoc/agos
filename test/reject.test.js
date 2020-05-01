const { pipe, listen, reject, never, teardown } = require("../dist/agos.cjs");

describe("reject", () => {
  it("should propagate error", () => {
    const error = new Error();

    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn(e => expect(e).toEqual(error));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      reject(error),
      listen(open, next, fail, done)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should propagate cancellation on open", () => {
    const error = new Error();
    const abort = teardown(never());

    const open = jest.fn(() => abort.run());
    const next = jest.fn();
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(
      reject(error),
      listen(open, next, fail, done, abort)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should not propagate cancellation before open", () => {
    const error = new Error();
    const abort = teardown(never());

    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn(e => expect(e).toEqual(error));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    abort.run();

    pipe(
      reject(error),
      listen(open, next, fail, done, abort)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should not propagate cancellation after open", () => {
    const error = new Error();
    const abort = teardown(never());

    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn(e => expect(e).toEqual(error));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      reject(error),
      listen(open, next, fail, done, abort)
    );

    abort.run();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
  });
});