const { interval } = require("./utils");

jest.useFakeTimers();

describe("skip", () => {
  it("should propagate selected data: positive start and positive end act as slice between", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 10);

    base.slice(4, 8).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(1000);

    expect(next).toHaveBeenCalledTimes(4);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([5, 6, 7, 8]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate selected data: positive start act as skip", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 10);

    base.slice(4).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(1000);

    expect(next).toHaveBeenCalledTimes(6);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([5, 6, 7, 8, 9, 10]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate selected data: positive end act as take that completes", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 10);

    base.slice(0, 4).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(1000);

    expect(next).toHaveBeenCalledTimes(4);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1, 2, 3, 4]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate selected data: negative start act as take from end", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 10);

    base.slice(-4).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(1000);

    expect(next).toHaveBeenCalledTimes(4);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([7, 8, 9, 10]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate selected data: negative end act as skip from end", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 10);

    base.slice(0, -4).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(1000);

    expect(next).toHaveBeenCalledTimes(6);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1, 2, 3, 4, 5, 6]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate selected data: negative start and negative end act as slice intersect", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 10);

    base.slice(-7, -5).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(1000);

    expect(next).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([4, 5]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });
});
