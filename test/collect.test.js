const { interval } = require("./utils");
const { pipe, listen, collect, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("collect", () => {
  it("should collect values from the given pipes", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 3),
      collect([map(v => v + "a"), map(v => v + "b")]),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(6);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([
      ["1a", 0],
      ["1b", 1],
      ["2a", 0],
      ["2b", 1],
      ["3a", 0],
      ["3b", 1]
    ]);
  });
});
