const { interval } = require("./utils");

jest.useFakeTimers();

describe("take", () => {
  it("should propagate data base on the number argument, then completes", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 3);

    base.take(1).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });
});
