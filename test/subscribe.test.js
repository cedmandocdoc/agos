const {
  pipe,
  subscribe,
  of,
  never,
  CancelInterceptor
} = require("../dist/agos.cjs");

describe("subscribe", () => {
  it("should accept single function and work as next", () => {
    const received = [];

    const next = jest.fn(value => received.push(value));

    pipe(
      of(1),
      subscribe(next)
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should accept a sink object", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      of(1),
      subscribe({ open, next, fail, done })
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should accept a talkback - last parameter", () => {
    const received = [];
    const cancel = new CancelInterceptor(never());

    const open = jest.fn(() => cancel.run());
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));


    pipe(
      of(1),
      subscribe({ open, next, fail, done }, cancel)
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
