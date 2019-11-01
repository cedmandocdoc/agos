const { createInterval, throwError } = require("./utils");

jest.useFakeTimers();

describe("filter", () => {
  it("should propagate data when function argument returns true", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();
    const filter = jest.fn(data => data < 3);

    const [base, baseStop] = createInterval(100, 3);

    base.filter(filter).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(filter).toHaveBeenCalledTimes(3);
    expect(received).toEqual([1, 2]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when function argument throws, no data propagation", () => {
    const err = new Error();

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const filter = jest.fn(throwError(err));

    const [base, baseStop] = createInterval(100, 3);

    base.filter(filter).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(filter).toHaveBeenCalledTimes(1);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when function argument throws, has data propagation", () => {
    const received = [];
    const err = new Error();

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));
    const filter = jest.fn(data => {
      if (data === 2) throw err;
      return data <= 3;
    });

    const [base, baseStop] = createInterval(100, 3);

    base.filter(filter).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(filter).toHaveBeenCalledTimes(2);
    expect(received).toEqual([1]);
    expect(baseStop).toHaveBeenCalledTimes(1);
  });
});
