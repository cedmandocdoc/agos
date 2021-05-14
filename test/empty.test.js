const { pipe, listen, empty } = require("../dist/agos.cjs");

describe("empty", () => {
  it("should propagate open only", () => {
    const open = jest.fn();
    const next = jest.fn();
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      empty(),
      listen({ open, next, fail, done })
    );

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(0);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(0);
  });
});
