const { interval } = require("./utils");
const { pipe, listen, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("map", () => {
  it("should transform value through project function and then propagate", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const project = jest.fn(value => value.toString());

    pipe(
      interval(100, 3),
      map(project),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(project).toHaveBeenCalledTimes(3);
    expect(received).toEqual(["1", "2", "3"]);
  });

  it("should propagate error when project function throws", () => {
    const received = [];
    const error = new Error();

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn(value => expect(value).toEqual(error));
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));
    const project = jest.fn(value => {
      if (value === 2) throw error;
      return value.toString();
    });

    pipe(
      interval(100, 3),
      map(project),
      listen({ open, next, fail, done })
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(fail).toHaveBeenCalledTimes(1);
    expect(done).toHaveBeenCalledTimes(1);
    expect(project).toHaveBeenCalledTimes(3);
    expect(received).toEqual(["1", "3"]);
  });
});
