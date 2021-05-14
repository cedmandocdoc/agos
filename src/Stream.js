import $$observable from "symbol-observable";
import { noop } from "./utils";

const IDLE = 0;
const ACTIVE = 1;
const DONE = 2;

class Stream {
  constructor(source) {
    this.source = source;
  }

  // observable interoperability
  [$$observable]() {
    return {
      subscribe: observer => {
        const sink = { next: noop, error: noop, complete: noop };

        if (typeof observer === "function") sink.next = observer;
        else {
          sink.next = observer.next;
          sink.error = observer.error;
          sink.complete = observer.complete;
        }

        const cancel = CancelInterceptor.join(new Stream(open => open()));

        this.listen(noop, sink.next, sink.error, sink.complete, cancel);

        return { unsubscribe: () => cancel.run() };
      }
    };
  }

  listen(open, next, fail, done, talkback) {
    const cancel = TalkbackCancelInterceptor.join(talkback);
    let state = IDLE;
    this.source(
      () => {
        if (state === IDLE) {
          state = ACTIVE;
          open();
        }
      },
      value => {
        if (state === ACTIVE) {
          try {
            next(value);
          } catch (error) {
            fail(error);
          }
        }
      },
      error => {
        if (state === ACTIVE) fail(error);
      },
      cancelled => {
        if (state === ACTIVE) {
          cancel.run();
          done(cancelled);
          state = DONE;
        }
      },
      cancel
    );
  }
}

Stream.CANCEL = Symbol("cancel");

export class Operator extends Stream {
  static join(stream, ...args) {
    return new this((open, next, fail, done, talkback) => {
      stream.listen(open, next, fail, done, talkback);
    }, ...args);
  }
}

export class CancelInterceptor extends Operator {
  constructor(source) {
    super(source);
    this.run = noop;
  }

  listen(open, next, fail, done, talkback) {
    this.run = () => next(Stream.CANCEL);
    super.listen(open, next, fail, done, talkback);
  }
}

export class TalkbackCancelInterceptor extends Operator {
  constructor(source) {
    super(source);
    this.run = noop;
  }

  listen(open, next, fail, done, talkback) {
    const cancel = CancelInterceptor.join(talkback);
    this.run = () => cancel.run();
    super.listen(open, next, fail, done, cancel);
  }
}

export default Stream;
