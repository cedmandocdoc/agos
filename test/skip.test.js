const { interval } = require("./utils");

jest.useFakeTimers();

describe("skip", () => {
  it("should skip data base on the number argument", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 3);

    base.skip(1).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([2, 3]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });
});
