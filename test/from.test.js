const { pipe, listen, from } = require("../dist/agos.cjs");

describe("from", () => {
  it("should propagate each data on array", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      from([1, 2, 3]),
      listen({ open, next, error, close })
    );

    control.open();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2, 3]);
  });
});
