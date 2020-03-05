const { interval } = require("./utils");
const { pipe, listen, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("map", () => {
  it("should transform data through project function and then propagate", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn();
    const close = jest.fn();
    const project = jest.fn(data => data.toString());

    const control = pipe(
      interval(100, 3),
      map(project),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(error).toHaveBeenCalledTimes(0);
    expect(close).toHaveBeenCalledTimes(1);
    expect(project).toHaveBeenCalledTimes(3);
    expect(received).toEqual(["1", "2", "3"]);
  });

  it("should propagate error when project function throws", () => {
    const received = [];
    const err = new Error();

    const open = jest.fn();
    const next = jest.fn(data => received.push(data));
    const error = jest.fn(data => expect(data).toEqual(err));
    const close = jest.fn();
    const project = jest.fn(data => {
      if (data === 2) throw err;
      return data.toString();
    });

    const control = pipe(
      interval(100, 3),
      map(project),
      listen({ open, next, error, close })
    );

    control.open();

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(project).toHaveBeenCalledTimes(3);
    expect(received).toEqual(["1", "3"]);
  });
});
