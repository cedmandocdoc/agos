const { Stream, interval } = require("./utils");

jest.useFakeTimers();

describe("join", () => {
  it("should flatten propagated stream: one level", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [stream, streamStop] = interval(100, 3);

    Stream.of(stream)
      .join()
      .start({
        next,
        complete,
        error
      });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(3);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1, 2, 3]);
    expect(streamStop).toHaveBeenCalledTimes(1);
  });

  it("should flatten propagated stream: two level", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [stream, streamStop] = interval(100, 3);

    Stream.of(Stream.of(stream))
      .join()
      .join()
      .start({
        next,
        complete,
        error
      });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(3);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1, 2, 3]);
    expect(streamStop).toHaveBeenCalledTimes(1);
  });

  it("should propagate error after stream propagates an error", () => {
    const received = [];
    const err = new Error();

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));

    const [stream, streamStop] = interval(100, 3);

    Stream.of(
      Stream.of(
        stream.map(a => {
          if (a === 2) throw err;
          return a;
        })
      )
    )
      .join()
      .join()
      .start({
        next,
        complete,
        error
      });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(received).toEqual([1]);
    expect(streamStop).toHaveBeenCalledTimes(1);
  });
});
