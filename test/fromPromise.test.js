const { pipe, listen, fromPromise, CancelInterceptor, empty } = require("../dist/agos.cjs");

describe("fromPromise", () => {
  it("should propagate the promise resolved value", complete => {
    const received = [];
    const promise = Promise.resolve(1);

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();

    const done = cancelled => {
      expect(open).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(1);
      expect(fail).toHaveBeenCalledTimes(0);
      expect(cancelled).toEqual(false)
      expect(received).toEqual([1]);
      complete();
    }

    pipe(
      fromPromise(promise),
      listen({ open, next, fail, done })
    );
  });

  it("should propagate the promise reject error", complete => {
    const error = new Error();
    const promise = Promise.reject(error);

    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn(value => expect(value).toEqual(error));

    const done = cancelled => {
      expect(open).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(0);
      expect(fail).toHaveBeenCalledTimes(1);
      expect(cancelled).toEqual(false)
      complete();
    }

    pipe(
      fromPromise(promise),
      listen({ open, next, fail, done })
    );
  });

  it("should propagate the promise cancellation", complete => {
    const received = [];
    const promise = Promise.resolve(1);
    const cancel = CancelInterceptor.join(empty());

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();

    const done = cancelled => {
      expect(open).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledTimes(0);
      expect(fail).toHaveBeenCalledTimes(0);
      expect(cancelled).toEqual(true)
      expect(received).toEqual([]);
      complete();
    }

    pipe(
      fromPromise(promise),
      listen({ open, next, fail, done }, cancel)
    );

    cancel.run(); // immediately cancel
  });
});
