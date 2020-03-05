const { pipe, listen, fail } = require("../dist/agos.cjs");

describe("fail", () => {
  it("should propagate error", () => {
    const err = new Error();

    const open = jest.fn();
    const next = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const close = jest.fn();

    const control = pipe(
      fail(err),
      listen({ open, next, error, close })
    );

    control.open();

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(0);
  });
});
