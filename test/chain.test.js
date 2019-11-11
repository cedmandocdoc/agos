const { interval } = require("./utils");

jest.useFakeTimers();

describe("chain", () => {
  it("should propagate data through stream chaining: one chain one emit", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 1);
    const [chain1, chain1Stop] = interval(200, 1);

    base
      .chain(() => chain1)
      .start({
        next,
        complete,
        error
      });

    jest.advanceTimersByTime(300);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1]);
    expect(baseStop).toHaveBeenCalledTimes(1);
    expect(chain1Stop).toHaveBeenCalledTimes(1);
  });

  it("should propagate data through stream chaining: one chain multiple emit", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 1);
    const [chain1, chain1Stop] = interval(200, 2);

    base
      .chain(() => chain1)
      .start({
        next,
        complete,
        error
      });

    jest.advanceTimersByTime(500);

    expect(next).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1, 2]);
    expect(baseStop).toHaveBeenCalledTimes(1);
    expect(chain1Stop).toHaveBeenCalledTimes(1);
  });

  it("should propagate data through stream chaining: multiple chain one emit", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 1);
    const [chain1, chain1Stop] = interval(200, 1);
    const [chain2, chain2Stop] = interval(300, 1);

    base
      .chain(() => chain1)
      .chain(() => chain2)
      .start({
        next,
        complete,
        error
      });

    jest.advanceTimersByTime(600);

    expect(next).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1]);
    expect(baseStop).toHaveBeenCalledTimes(1);
    expect(chain1Stop).toHaveBeenCalledTimes(1);
    expect(chain2Stop).toHaveBeenCalledTimes(1);
  });

  it("should chain propagation of data: multiple chain multiple emit", () => {
    const received = [];

    const next = jest.fn(data => received.push(data));
    const complete = jest.fn();
    const error = jest.fn();

    const [base, baseStop] = interval(100, 1);
    const [chain1, chain1Stop] = interval(200, 2);
    const [chain2, chain2Stop] = interval(300, 3);

    base
      .chain(() => chain1)
      .chain(() => chain2)
      .start({
        next,
        complete,
        error
      });

    jest.advanceTimersByTime(1400);

    expect(next).toHaveBeenCalledTimes(6);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(0);
    expect(received).toEqual([1, 1, 2, 2, 3, 3]);
    expect(baseStop).toHaveBeenCalledTimes(1);
    expect(chain1Stop).toHaveBeenCalledTimes(1);
    expect(chain2Stop).toHaveBeenCalledTimes(2);
  });

  it("should propagate error after one chain function throws an error", () => {
    const err = new Error();

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn();
    const chain = jest.fn(() => {
      throw err;
    });

    const [base, baseStop] = interval(100, 1);
    const [chain1, chain1Stop] = interval(200, 1);
    const [chain2, chain2Stop] = interval(300, 1);

    base
      .chain(() => chain1)
      .chain(chain)
      .chain(() => chain2)
      .start({
        next,
        complete,
        error
      });

    jest.advanceTimersByTime(600);

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);
    expect(chain).toHaveBeenCalledTimes(1);
    expect(baseStop).toHaveBeenCalledTimes(1);
    expect(chain1Stop).toHaveBeenCalledTimes(1);
    expect(chain2Stop).toHaveBeenCalledTimes(0);
  });

  it("should propagate error after one stream propagates an error", () => {
    const err = new Error();

    const next = jest.fn();
    const complete = jest.fn();
    const error = jest.fn(data => expect(data).toEqual(err));

    const [base, baseStop] = interval(100, 1);
    const [chain1, chain1Stop] = interval(200, 1);
    const [chain2, chain2Stop] = interval(300, 1);
    const [chain3, chain3Stop] = interval(300, 1);

    base
      .chain(() => chain1)
      .chain(() =>
        chain2.map(() => {
          throw err;
        })
      )
      .chain(() => chain3)
      .start({
        next,
        complete,
        error
      });

    jest.advanceTimersByTime(600);

    expect(next).toHaveBeenCalledTimes(0);
    expect(complete).toHaveBeenCalledTimes(0);
    expect(error).toHaveBeenCalledTimes(1);

    expect(baseStop).toHaveBeenCalledTimes(1);
    expect(chain1Stop).toHaveBeenCalledTimes(1);
    expect(chain2Stop).toHaveBeenCalledTimes(1);
    expect(chain3Stop).toHaveBeenCalledTimes(0);
  });
});
