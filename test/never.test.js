const { Stream } = require("./utils");

describe("never method of Stream", () => {
  it("should be a static method", () => {
    expect(Stream.never).toBeInstanceOf(Function);
  });

  it("should create Stream", () => {
    expect(Stream.never()).toBeInstanceOf(Stream);
  });

  it("should not propagate any data, complete or an error", () => {
    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();
    Stream.never().start({
      next,
      complete,
      error
    });

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(0);
  });
});
