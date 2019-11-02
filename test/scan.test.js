const { interval } = require("./utils");

jest.useFakeTimers();

describe("scan", () => {
  it("should propagate accumulated data", () => {
    const expected = [1, 3, 6];

    const next = jest.fn(data => expect(data).toEqual(expected.shift()));
    const complete = jest.fn();
    const error = jest.fn();
    const scan = jest.fn((acc, curr) => acc + curr);

    const [base, baseStop] = interval(100, 3);

    base.scan(scan, 0).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(3);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(scan).toHaveBeenCalledTimes(3);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when accumulator function throws, no data propagation", () => {
    const err = new Error();

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const scan = jest.fn(() => {
      throw err;
    });

    const [base, baseStop] = interval(100, 3);

    base.scan(scan, 0).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(scan).toHaveBeenCalledTimes(1);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when accumulator function throws, has data propagation", () => {
    const expected = [1, 3];
    const err = new Error();

    const next = jest.fn(data => expect(data).toEqual(expected.shift()));
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const scan = jest.fn((acc, curr) => {
      if (curr === 3) throw err;
      return acc + curr;
    });

    const [base, baseStop] = interval(100, 3);

    base.scan(scan, 0).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(scan).toHaveBeenCalledTimes(3);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });
});
