const { interval } = require("./utils");
const { pipe, listen, ap, of, fromArray, map } = require("../dist/agos.cjs");

jest.useFakeTimers();

describe("ap", () => {
  it("should apply the latest stream value to one sync stream function", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 3),
      ap(of(value => value + 1)),
      listen(open, next, fail, done)
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([2, 3, 4]);
  });

  it("should apply the latest stream value to more than one sync stream function", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 3),
      ap(
        pipe(
          fromArray([value => value + 1, value => value + 2]),
          map(([value]) => value)
        )
      ),
      listen(open, next, fail, done)
    );

    jest.advanceTimersByTime(300);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(3);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([3, 4, 5]);
  });

  it("should apply the latest stream value to more than one async stream function", () => {
    const received = [];

    const open = jest.fn();
    const next = jest.fn(value => received.push(value));
    const fail = jest.fn();
    const done = jest.fn(cancelled => expect(cancelled).toEqual(false));

    pipe(
      interval(100, 3),
      ap(
        pipe(
          interval(200, 3),
          map(a => b => a + b)
        )
      ),
      listen(open, next, fail, done)
    );

    jest.advanceTimersByTime(1000);

    expect(open).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(4);
    expect(fail).toHaveBeenCalledTimes(0);
    expect(done).toHaveBeenCalledTimes(1);
    expect(received).toEqual([3, 4, 5, 6]);
  });
});

// pipe(
//   interval(100, 3),
//   ap(
//     pipe(
//       interval(200, 3),
//       map(a => b => a + b)
//     )
//   ),
//   listen(
//     () => console.log('open'),
//     d => console.log(d, 'asd'),
//     e => console.log('error'),
//     c => console.log(c, 'done')
//   )
// );
