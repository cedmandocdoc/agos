const { pipe, listen, never } = require("../dist/agos.cjs");

describe("never", () => {
  it("should not propagate any data or an error", () => {
    const open = jest.fn();
    const next = jest.fn();
    const error = jest.fn();
    const close = jest.fn();

    const control = pipe(
      never(),
      listen({ open, next, error, close })
    );

    control.open();
    control.close();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
