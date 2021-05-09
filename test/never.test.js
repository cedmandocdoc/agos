const { pipe, listen, never } = require("../dist/agos.cjs");

describe("never", () => {
  it("should not propagate any", () => {
    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn();
    const done = jest.fn();

    pipe(
      never(),
      listen({ open, next, fail, done })
    );

    expect(open).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(0);
  });
});
