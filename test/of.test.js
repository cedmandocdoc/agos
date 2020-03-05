const { pipe, listen, of } = require("../dist/agos.cjs");

describe("of", () => {
  it("should propagate the argument", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      of(1),
      listen({ open, next, error, close })
    );

    control.open();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
