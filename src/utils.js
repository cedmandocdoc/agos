import { CANCEL } from "./constants";

export const noop = () => {};

export const pipe = (...cbs) => {
  let res = cbs[0];
  for (let i = 1, n = cbs.length; i < n; i++) res = cbs[i](res);
  return res;
};

export class NextInterceptor {
  constructor(source) {
    this.source = source;
    this.next = noop;
  }

  listen(open, next, fail, done, talkback) {
    this.next = value => next(value);
    this.source.listen(open, next, fail, done, talkback);
  }
}

export class CancelInterceptor {
  constructor(source) {
    this.source = new NextInterceptor(source);
    this.run = noop;
  }

  listen(open, next, fail, done, talkback) {
    this.run = () => this.source.next([CANCEL]);
    this.source.listen(open, next, fail, done, talkback);
  }
}

export class TalkbackCancelInterceptor {
  constructor(source) {
    this.source = source;
    this.run = noop;
  }

  listen(open, next, fail, done, talkback) {
    const cancel = new CancelInterceptor(talkback);
    this.run = () => cancel.run();
    this.source.listen(open, next, fail, done, cancel);
  }
}
