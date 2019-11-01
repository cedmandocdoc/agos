const { Stream } = require("./utils");

describe("throw", () => {
  it("should propagate error", () => {
    const err = new Error();

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));

    Stream.throw(err).start({
      next,
      complete,
      error
    });

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
  });
});
