const { createInterval, throwError } = require("./utils");

jest.useFakeTimers();

describe("tap", () => {
  it("should apply the data to the function argument and then propagate", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();
    const tap = jest.fn();

    const [base, baseStop] = createInterval(100, 3);

    base.tap(tap).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(3);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(tap).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 2, 3]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when function argument throws, no data propagation", () => {
    const err = new Error();

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const tap = jest.fn(throwError(err));

    const [base, baseStop] = createInterval(100, 3);

    base.tap(tap).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(tap).toHaveBeenCalledTimes(1);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when function argument throws, has data propagation", () => {
    const received = [];
    const err = new Error();

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const tap = jest.fn(data => {
      if (data === 2) throw err;
    });

    const [base, baseStop] = createInterval(100, 3);

    base.tap(tap).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(tap).toHaveBeenCalledTimes(2);
    expect(received).toEqual([1]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });
});
