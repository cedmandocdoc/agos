const { interval } = require("./utils");
const { pipe, listen, map, collectLatest } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("collectLatest", () => {
  it("should collect latest values from the given pipes", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 3),
      collectLatest([map(v => v + "a"), map(v => v + "b")]),
      listen(open, next, fail, done)
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(5);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([
      ["1a", "1b"],
      ["2a", "1b"],
      ["2a", "2b"],
      ["3a", "2b"],
      ["3a", "3b"]
    ]);
  });
});
