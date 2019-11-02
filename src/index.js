const noop = () => {};
const compose = (f, g) => d => f(g(d));
const always = d => () => d;
const and = (f, g) => d => f(d) && g(d);
const or = (f, g) => d => f(d) || g(d);
const tap = f => d => (f(d) || true) && d;

const run = (source, sink) => {
  let active = true;
  let stop = noop;
  let control;

  const able = () => active;

  const disable = () => (active = false);

  const next = d => {
    if (!active) return;
    sink.next(d);
  };

  const complete = () => {
    if (!active) return;
    active = false;
    stop();
    sink.complete();
  };

  const error = e => {
    if (!active) return;
    active = false;
    stop();
    sink.error(e);
  };

  try {
    control = source({ next, complete, error, able, disable });
  } catch (e) {
    error(e);
  }

  stop = control && control.stop;

  return control;
};

class Safe {
  constructor(source) {
    this.source = source;
  }

  wrap() {
    return this;
  }

  extract() {
    return sink =>
      this.source({
        ...sink,
        next: d => {
          try {
            sink.able() && sink.next(d);
          } catch (e) {
            sink.error(e);
          }
        }
      });
  }
}

class Transform {
  constructor(source, fn) {
    this.source = source;
    this.fn = fn;
  }

  static of(source, fn) {
    return source instanceof Transform
      ? source.wrap(fn)
      : new Transform(source.extract(), fn);
  }

  wrap(fn) {
    return new Transform(
      this.source,
      compose(
        fn,
        this.fn
      )
    );
  }

  extract() {
    return sink =>
      this.source({
        ...sink,
        next: compose(
          sink.next,
          this.fn
        )
      });
  }
}

class Filter {
  constructor(source, fn) {
    this.source = source;
    this.fn = fn;
  }

  static of(source, fn) {
    return source instanceof Filter
      ? source.wrap(fn)
      : new Filter(source.extract(), fn);
  }

  wrap(fn) {
    return new Filter(this.source, and(this.fn, fn));
  }

  extract() {
    return sink =>
      this.source({
        ...sink,
        next: and(this.fn, sink.next)
      });
  }
}

class Slice {
  constructor(source, skip = 0, take = Infinity) {
    this.source = source;
    this.skip = skip;
    this.take = take;
  }

  static of(source, skip = 0, take = Infinity) {
    return source instanceof Slice
      ? source.wrap(skip, take)
      : new Slice(source.extract(), skip, take);
  }

  wrap(skip = 0, take = this.take) {
    return new Slice(
      this.source,
      this.skip + skip,
      take < this.take ? take : this.take
    );
  }

  extract() {
    return sink => {
      let count = 0;
      return this.source({
        ...sink,
        next: d => {
          count++;
          count > this.skip && sink.next(d);
          count >= this.take && sink.complete();
        }
      });
    };
  }
}

class While {
  constructor(source, fn) {
    this.source = source;
    this.fn = fn;
  }

  static of(source, fn) {
    return source instanceof While
      ? source.wrap(fn)
      : new While(source.extract(), fn);
  }

  wrap(fn) {
    return new While(this.source, or(this.fn, fn));
  }

  extract() {
    return sink =>
      this.source({
        ...sink,
        next: d => {
          if (!this.fn(d)) return sink.complete();
          sink.next(d);
        }
      });
  }
}

class Pipe {
  constructor(source, pipe) {
    this.source = source;
    this.pipe = pipe;
  }

  static of(source, pipe) {
    return source instanceof Pipe
      ? source.wrap(pipe)
      : new Pipe(source.extract(), pipe);
  }

  wrap(pipe) {
    return new Pipe(
      this.source,
      compose(
        pipe,
        this.pipe
      )
    );
  }

  extract() {
    return compose(
      this.source,
      this.pipe
    );
  }
}

class Chain {
  constructor(source, fns) {
    this.source = source;
    this.fns = fns;
  }

  static of(source, fns) {
    return source instanceof Chain
      ? source.wrap(fns)
      : new Chain(source.extract(), fns);
  }

  wrap(fns) {
    return new Chain(this.source, [...this.fns, ...fns]);
  }

  extract() {
    // TO DO clean up propagation
    return sink => {
      let teardowns = [];
      let index = 0;

      const complete = curr => () => {
        // console.log(curr);
        index--;
        if (curr === 0) teardowns[0] && teardowns[0]();
        teardowns[curr] = null;
        if (index < 0) sink.complete();
      };

      const error = sink.error;

      const recursiveNext = current => {
        const fn = this.fns[current];
        return data => {
          const stream = fn(data);

          const next =
            current >= this.fns.length - 1
              ? sink.next
              : recursiveNext(current + 1);

          index++;
          const control = stream.producer.start({
            complete: complete(index),
            error,
            next
          });
          teardowns[index] = control.stop;
        };
      };

      const control = this.source({
        ...sink,
        complete: complete(index),
        error,
        next: recursiveNext(index)
      });

      if (teardowns[index] === undefined) teardowns[index] = control.stop;

      return {
        ...control,
        stop: () => {
          for (let index = 0; index < teardowns.length; index++) {
            const teardown = teardowns[index];
            teardown && teardown();
          }
          teardowns = [];
          index = 0;
        }
      };
    };
  }
}

class Merge {
  constructor(streams) {
    this.streams = streams;
  }

  static of(source, streams) {
    return source instanceof Merge
      ? source.wrap([new Stream(new Producer(source)), ...streams])
      : new Merge(source.extract(), streams);
  }

  wrap(streams) {
    return new Merge([...this.streams, ...streams]);
  }

  extract() {
    return sink => {
      const streams = this.streams;
      let pending = streams.length;
      const teardowns = [];

      const stop = () => {
        for (let index = 0; index < teardowns.length; index++) {
          const teardown = teardowns[index];
          teardown();
        }
      };

      const complete = index => () => {
        pending--;
        teardowns[index] = () => {};
        if (pending <= 0) sink.complete();
      };

      const error = index => e => {
        teardowns[index] = () => {};
        sink.error(e);
      };

      for (let index = 0; index < streams.length; index++) {
        const stream = streams[index];
        const control = stream.producer.start({
          next: data => sink.next(data, index),
          complete: complete(index),
          error: error(index)
        });
        teardowns.push(control.stop);
      }

      return { stop };
    };
  }
}

class Producer {
  constructor(source) {
    this.source = source;
  }

  static of(source) {
    return new Producer(new Safe(source));
  }

  transform(fn) {
    return new Producer(Transform.of(this.source, fn));
  }

  filter(fn) {
    return new Producer(Filter.of(this.source, fn));
  }

  slice(skip, take) {
    return new Producer(Slice.of(this.source, skip, take));
  }

  while(fn) {
    return new Producer(While.of(this.source, fn));
  }

  chain(fns) {
    return new Producer(Chain.of(this.source, fns));
  }

  start(sink) {
    return run(this.source.extract(), sink);
  }
}

class Stream {
  constructor(producer) {
    this.producer =
      producer instanceof Producer ? producer : Producer.of(producer);
  }

  static of(data) {
    return new Stream(sink => {
      sink.next(data);
      sink.complete();
      return { stop: noop };
    });
  }

  static from(data) {
    return new Stream(sink => {
      for (let index = 0; index < data.length; index++) {
        sink.next(data[index]);
      }
      sink.complete();
      return { stop: noop };
    });
  }

  static empty() {
    return new Stream(sink => {
      sink.complete();
      return { stop: noop };
    });
  }

  static throw(error) {
    return new Stream(sink => {
      sink.error(error);
      return { stop: noop };
    });
  }

  static never() {
    return new Stream(() => ({ stop: noop }));
  }

  static merge(streams) {
    const source = new Merge(streams).extract();
    return new Stream(source);
  }

  static mergeLatest(streams) {
    const source = new Pipe(new Merge(streams).extract(), sink => {
      const seen = [];
      const values = streams.map(() => null);

      const next = (data, index) => {
        values[index] = data; // mutates the current data
        if (!seen[index]) seen[index] = true;
        if (seen.length === streams.length) sink.next(values);
      };
      return {
        ...sink,
        next
      };
    }).extract();
    return new Stream(source);
  }

  map(fn) {
    return new Stream(this.producer.transform(fn));
  }

  tap(fn) {
    return new Stream(this.producer.transform(tap(fn)));
  }

  filter(fn) {
    return new Stream(this.producer.filter(fn));
  }

  take(n) {
    return new Stream(this.producer.slice(0, n));
  }

  takeWhile(fn) {
    return new Stream(this.producer.while(fn));
  }

  skip(n) {
    return new Stream(this.producer.slice(n));
  }

  skipWhile(fn) {
    return new Stream(this.producer.filter(d => !fn(d)));
  }

  join() {
    return new Stream(this.producer.chain(always(this)));
  }

  chain(...fns) {
    return new Stream(this.producer.chain(fns));
  }

  start(sink) {
    const destination = {
      next: noop,
      error: noop,
      complete: noop
    };

    if (typeof sink === "function") destination.next = sink;
    else if (typeof sink === "object") {
      destination.next = sink.next;
      destination.complete = sink.complete;
      destination.error = sink.error;
    }

    return this.producer.start(destination);
  }
}

module.exports = Stream;
