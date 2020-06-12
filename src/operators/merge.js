import create from "./create";
import never from "./never";
import { noop, CancelInterceptor } from "../utils";
import { CANCEL } from "../constants";

const merge = sources =>
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
      source.listen(
        open,
        value => next([value, index]),
        error => fail([error, index]),
        () => {
          closed[index] = true;
          if (closed.length === sources.length) done(false);
        },
        cancel
      );
    }
  });

export default merge;
