const { interval } = require("./utils");

jest.useFakeTimers();

describe("takeWhile", () => {
  it("should propagate data when function argument returns true, then completes", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();
    const takeWhile = jest.fn(data => data < 3);

    const [base, baseStop] = interval(100, 3);

    base.takeWhile(takeWhile).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(takeWhile).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 2]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when function argument throws, no data propagation", () => {
    const err = new Error();

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const takeWhile = jest.fn(() => {
      throw err;
    });

    const [base, baseStop] = interval(100, 3);

    base.takeWhile(takeWhile).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(takeWhile).toHaveBeenCalledTimes(1);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when function argument throws, has data propagation", () => {
    const received = [];
    const err = new Error();

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const takeWhile = jest.fn(data => {
      if (data === 2) throw err;
      return data < 3;
    });

    const [base, baseStop] = interval(100, 3);

    base.takeWhile(takeWhile).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(takeWhile).toHaveBeenCalledTimes(2);
    expect(received).toEqual([1]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });
});
