import create from "./create";
import never from "./never";
import { noop, CancelInterceptor } from "../utils";
import { CANCEL } from "../constants";

const merge = (sources, withIndex = false) =>
  create((open, next, fail, done, talkback) => {
    const closed = [];
    const cancels = [];
    talkback.listen(
      noop,
      payload => {
        if (payload[0] === CANCEL) {
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
    for (let index = 0; index < sources.length; index++) {
      const source = sources[index];
      const cancel = new CancelInterceptor(never());
      cancels[index] = cancel;
      closed[index] = false;
      source.listen(
        open,
        (value) => next(withIndex ? [value, index] : value),
        (error) => fail(withIndex ? [error, index] : error),
        () => {
          closed[index] = true;
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
