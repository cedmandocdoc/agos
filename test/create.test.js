const { noop } = require("./utils");
const { pipe, listen, create, Stream, empty } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("create", () => {
  it("should not propagate when idle", () => {
    const source = create((open, next, fail, done) => {
      next();
      next();
      fail();
      done();
    });

    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn();
    const done = jest.fn();

    pipe(source, listen({ open, next, fail, done }));

    expect(open).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(0);
  });

  it("should only propagate when active", () => {
    const source = create((open, next, fail) => {
      open();
      next(1);
      next(2);
      fail(new Error());
    });

    const received = [];
    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn(error => expect(error instanceof Error).toEqual(true));
    const done = jest.fn();

    pipe(source, listen({ open, next, fail, done }));

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1, 2]);
  });

  it("should not propagate on done", () => {
    const source = create((open, next, fail, done) => {
      open();
      next(1);
      next(2);
      fail(new Error("error"));
      done(false);
      open();
      next(1);
      next(2);
      fail(new Error("error"));
      done(false);
    });

    const received = [];
    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn(error => expect(error.message).toEqual("error"));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(source, listen({ open, next, fail, done }));

    jest.advanceTimersByTime(1000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2]);
  });

  it("should close the talkback when cancelled", () => {
    const source = create((open, next, fail, done, talkback) => {
      const topen = jest.fn();
      const tnext = jest.fn(value => {
        expect(value).toEqual(Stream.CANCEL);
        // upon receiving cancellation
        // token, source should be completed
        done(true);
      });
      const tfail = jest.fn();
      const tdone = jest.fn(cancelled => expect(cancelled).toEqual(true));

      open();
      next(1);
      next(2);
      talkback.listen(
        topen,
        tnext,
        tfail,
        tdone,
        create(open => open())
      );
      // should not get called because
      // the talkback will emit a cancellation
      // token before reaching at this point
      fail(new Error("error"));
      next(3);

      expect(topen).toHaveBeenCalledTimes(1);
      expect(tnext).toHaveBeenCalledTimes(1);
      expect(tfail).toHaveBeenCalledTimes(0);
      expect(tdone).toHaveBeenCalledTimes(1);
    });

    const talkback = create((open, next, fail, done, external) => {
      open();
      external.listen(
        noop,
        () => done(true),
        noop,
        noop,
        create(open => open())
      );
      next(Stream.CANCEL);
      // should not get called, since the source
      // has received a cancellation token it
      // will immediately call done
      next(Stream.CANCEL);
    });

    const received = [];
    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn(error => expect(error.message).toEqual("error"));
    const done = jest.fn(cancelled => expect(cancelled));

    pipe(source, listen({ open, next, fail, done }, talkback));

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2]);
  });

  it("should close the talkback when complete", () => {
    const source = create((open, next, fail, done, talkback) => {
      const received = [];
      const topen = jest.fn();
      const tnext = jest.fn(value => received.push(value));
      const tfail = jest.fn();
      const tdone = jest.fn(cancelled => expect(cancelled).toEqual(true));

      open();
      next(1);
      next(2);
      talkback.listen(
        topen,
        tnext,
        tfail,
        tdone,
        create(open => open())
      );
      fail(new Error("error"));
      next(3);
      done(false); // after done, talkback should received a cancellation token

      expect(topen).toHaveBeenCalledTimes(1);
      expect(tnext).toHaveBeenCalledTimes(2);
      expect(tfail).toHaveBeenCalledTimes(0);
      expect(tdone).toHaveBeenCalledTimes(1);
      expect(received).toEqual([1, 2]);
    });

    const talkback = create((open, next, fail, done, external) => {
      open();
      const id = setTimeout(() => next("final")); // should not get called
      external.listen(
        noop,
        value => {
          // when the source is done it will propagate a cancellation token
          expect(value).toEqual(Stream.CANCEL);
          done(true);
          clearTimeout(id); // clear the async propagation
        },
        noop,
        noop,
        create(open => open())
      );
      next(1);
      next(2);
    });

    const received = [];
    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn(error => expect(error.message).toEqual("error"));
    const done = jest.fn(cancelled => expect(cancelled));

    pipe(source, listen({ open, next, fail, done }, talkback));

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3]);
  });
});
