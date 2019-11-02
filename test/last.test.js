const { interval } = require("./utils");

jest.useFakeTimers();

describe("last", () => {
  it("should propagate last data after stream completes", () => {
    const expected = [3];

    const next = jest.fn(data => expect(data).toEqual(expected.shift()));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 3);

    base.last().start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });
});
