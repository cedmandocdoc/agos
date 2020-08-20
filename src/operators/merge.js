import create from "./create";
import never from "./never";
import Observable, { CancelInterceptor } from "../Observable";
import { noop } from "../utils";

const merge = (observables, withIndex = false) =>
  create((open, next, fail, done, talkback) => {
    const closed = [];
    const cancels = [];
    talkback.listen(
      noop,
      payload => {
        if (payload[0] === Observable.CANCEL) {
          for (let index = 0; index < cancels.length; index++) {
            const cancel = cancels[index];
            cancel.run();
          }
          done(true);
        }
      },
      noop,
      noop,
      never()
    );
    for (let index = 0; index < observables.length; index++) {
      const observable = observables[index];
      const cancel = CancelInterceptor.join(never());
      cancels[index] = cancel;
      closed[index] = false;
      observable.listen(
        open,
        value => next(withIndex ? [value, index] : value),
        error => fail(withIndex ? [error, index] : error),
        () => {
          closed[index] = true;
          if (closed.length !== observables.length) return;
          let allClosed = true;
          for (let index = 0; index < closed.length; index++) {
            if (!closed[index]) {
              allClosed = false;
              break;
            }
          }
          if (allClosed) done(false);
        },
        cancel
      );
    }
  });

export default merge;
