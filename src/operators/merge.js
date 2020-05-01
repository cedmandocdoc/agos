import create from "./create";
import never from "./never";
import teardown from "./teardown";
import { noop } from "../utils";
import { CANCEL } from "../constants";

const merge = sources =>
  create((open, next, fail, done, talkback) => {
    const closed = [];
    const aborts = [];
    talkback.listen(
      noop,
      value => {
        if (value === CANCEL) {
          for (let index = 0; index < aborts.length; index++) {
            const abort = aborts[index];
            abort.run();
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
      const abort = teardown(never());
      aborts.push(abort);
      source.listen(
        open,
        value => next([value, index]),
        error => fail([error, index]),
        () => {
          closed[index] = true;
          if (closed.length === sources.length) done(false);
        },
        abort
      );
    }
  });

export default merge;
