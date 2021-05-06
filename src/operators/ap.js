import Stream, { CancelInterceptor, Operator } from "../Stream";
import never from "./never";
import tap from "./tap";

class Apply extends Operator {
  constructor(source, fnstreams) {
    super(source);
    this.fnstreams = fnstreams;
  }

  static join(stream, fnstream) {
    return stream instanceof Apply
      ? new Apply(stream.source, [...stream.fnstreams, fnstream])
      : super.join(stream, [fnstream]);
  }

  listen(open, next, fail, done, talkback) {
    const fns = new Map();
    const cancels = [];
    let hasLatest = false;
    let latest = null;
    let cancelled = false;
    let active = 0;

    const flush = () => {
      if (fns.size >= this.fnstreams.length && hasLatest) {
        // compose map
        let data = latest;
        for (const fn of fns.values()) {
          data = fn(data);
        }
        next(data);
      }
    };

    const run = index => {
      const stream = this.fnstreams[index];
      const cancel = CancelInterceptor.join(never());
      cancels.push(cancel);

      stream.listen(
        () => {
          active++;
          index >= this.fnstreams.length - 1 ? open() : run(index + 1);
        },
        fn => {
          fns.set(index, fn);
          flush();
        },
        fail,
        () => --active <= 0 && done(cancelled),
        cancel
      );
    };

    this.source(
      () => {
        active++;
        run(0);
      },
      data => {
        if (!hasLatest) hasLatest = true;
        latest = data;
        flush();
      },
      fail,
      () => --active <= 0 && done(cancelled),
      tap(payload => {
        if (payload === Stream.CANCEL) {
          cancelled = true;
          for (let index = 0; index < cancels.length; index++) {
            const cancel = cancels[index];
            cancel.run();
          }
        }
      })(talkback)
    );
  }
}

const ap = fnstream => stream => Apply.join(stream, fnstream);

export default ap;
