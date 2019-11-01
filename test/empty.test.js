const { Stream } = require("./utils");

describe("empty", () => {
  it("should propagate complete", () => {
    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    Stream.empty().start({
      next,
      complete,
      error
    });

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
  });
});
