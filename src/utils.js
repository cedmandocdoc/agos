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

export class TalkbackNextInterceptor {
  constructor(source) {
    this.source = source;
    this.next = noop;
  }

  listen(open, next, fail, done, talkback) {
    const source = new NextInterceptor(talkback);
    this.next = value => source.next(value);
    this.source.listen(open, next, fail, done, source);
  }
}
