const { pipe, listen, empty } = require("../dist/agos.cjs");

describe("empty", () => {
  it("should propagate close", () => {
    const open = jest.fn();
    const next = jest.fn();
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      empty(),
      listen({ open, next, error, close })
    );

    control.open();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
