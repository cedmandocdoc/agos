const { Stream, createInterval, throwError } = require("./utils");

jest.useFakeTimers();

describe("merge", () => {
  it("should propagate data from all values of the streams", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [interval1, interval1Stop] = createInterval(100, 3);
    const [interval2, interval2Stop] = createInterval(200, 2);

    Stream.merge([interval1, interval2]).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(400);

    expect(next).toHaveBeenCalledTimes(5);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1, 2, 1, 3, 2]);
    expect(interval1Stop).toHaveBeenCalledTimes(1);
    expect(interval2Stop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error when one stream propagates an error", () => {
    const err = new Error();
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));

    const [interval1, interval1Stop] = createInterval(100, 3);
    const [interval2, interval2Stop] = createInterval(200, 2);

    Stream.merge([interval1, interval2.map(throwError(err))]).start({
      next,
      complete,
      error
    });

    jest.advanceTimersByTime(400);

    expect(next).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1, 2]);
    expect(interval1Stop).toHaveBeenCalledTimes(1);
    expect(interval2Stop).toHaveBeenCalledTimes(1);
  });
});
