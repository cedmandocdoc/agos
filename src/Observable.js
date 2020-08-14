import { noop } from "./utils";

const IDLE = 0;
const ACTIVE = 1;
const DONE = 2;

class Observable {
  constructor(source) {
    this.source = source;
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

Observable.CANCEL = Symbol("cancel");

export class Operator extends Observable {
  static join(observable, ...args) {
    return new this((open, next, fail, done, talkback) => {
      observable.listen(open, next, fail, done, talkback);
    }, ...args);
  }
}

export class CancelInterceptor extends Operator {
  constructor(source) {
    super(source);
    this.run = noop;
  }

  listen(open, next, fail, done, talkback) {
    this.run = () => next([Observable.CANCEL]);
    this.source(open, next, fail, done, talkback);
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
    this.source(open, next, fail, done, cancel);
  }
}

export default Observable;
