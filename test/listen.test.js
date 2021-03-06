const { pipe, listen, of, CancelSignal } = require("../dist/agos.cjs");

describe("listen", () => {
  it("should accept single function and work as next", () => {
    const received = [];

    const next = jest.fn(value => received.push(value));

    pipe(of(1), listen(next));

    expect(next).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should accept a sink object", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(of(1), listen({ open, next, fail, done }));

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should accept a partial sink object", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(of(1), listen({ open, next, done }));

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
  });

  it("should accept a talkback - last parameter", () => {
    const received = [];
    const cancel = new CancelSignal();

    const open = jest.fn(() => cancel.run());
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(true));

    pipe(of(1), listen({ open, next, fail, done }, cancel));

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
