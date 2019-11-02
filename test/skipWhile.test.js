const { interval } = require("./utils");

jest.useFakeTimers();

describe("skipWhile", () => {
  it("should skip data when function argument returns true", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();
    const skipWhile = jest.fn(data => data === 1);

    const [base, baseStop] = interval(100, 3);

    base.skipWhile(skipWhile).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(skipWhile).toHaveBeenCalledTimes(3);
    expect(received).toEqual([2, 3]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when function argument throws, no data propagation", () => {
    const err = new Error();

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const skipWhile = jest.fn(() => {
      throw err;
    });

    const [base, baseStop] = interval(100, 3);

    base.skipWhile(skipWhile).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(skipWhile).toHaveBeenCalledTimes(1);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when function argument throws, has data propagation", () => {
    const received = [];
    const err = new Error();

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const skipWhile = jest.fn(data => {
      if (data === 3) throw err;
      return data === 1;
    });

    const [base, baseStop] = interval(100, 3);

    base.skipWhile(skipWhile).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(skipWhile).toHaveBeenCalledTimes(3);
    expect(received).toEqual([2]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });
});
