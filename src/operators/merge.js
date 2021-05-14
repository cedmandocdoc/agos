import create from "./create";
import empty from "./empty";
import Stream, { CancelInterceptor } from "../Stream";
import { noop } from "../utils";

const merge = (streams, withIndex = false) =>
  create((open, next, fail, done, talkback) => {
    const closed = [];
    const cancels = [];
    talkback.listen(
      noop,
      payload => {
        if (payload === Stream.CANCEL) {
          for (let index = 0; index < cancels.length; index++) {
            const cancel = cancels[index];
            cancel.run();
          }
          done(true);
        }
      },
      noop,
      noop,
      empty()
    );
    for (let index = 0; index < streams.length; index++) {
      const stream = streams[index];
      const cancel = CancelInterceptor.join(empty());
      cancels[index] = cancel;
      closed[index] = false;
      stream.listen(
        open,
        value => next(withIndex ? [value, index] : value),
        error => fail(withIndex ? [error, index] : error),
        () => {
          closed[index] = true;
          if (closed.length !== streams.length) return;
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
