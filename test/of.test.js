const { Stream } = require("./utils");

describe("of", () => {
  it("should propagate the argument", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    Stream.of(1).start({
      next,
      complete,
      error
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1]);
  });
});
