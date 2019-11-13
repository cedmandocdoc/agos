const { Stream } = require("./utils");

jest.useFakeTimers();

describe("start", () => {
  it("should accept partial sink object", () => {
    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();

    Stream.of(1).start({
      next
    });

    Stream.of(1).start({
      complete
    });

    Stream.of(1).start({
      error
    });

    Stream.of(1).start({
      next,
      complete
    });

    Stream.of(1).start({
      complete,
      error
    });

    Stream.of(1).start({
      next,
      error
    });

    expect(next).toHaveBeenCalledTimes(3);
    expect(complete).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenCalledTimes(0);
  });

  it("should accept function and acts as next", () => {
    const next = jest.fn();

    Stream.of(1).start(next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
