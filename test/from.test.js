const { Stream } = require("./utils");

describe("from", () => {
  it("should propagate each items", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    Stream.from([1, 2, 3]).start({
      next,
      complete,
      error
    });

    expect(next).toHaveBeenCalledTimes(3);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1, 2, 3]);
  });
});
